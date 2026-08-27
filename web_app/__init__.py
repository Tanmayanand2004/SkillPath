import os
import redis
from rq import Queue
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_migrate import Migrate
from config import Config
from werkzeug.middleware.proxy_fix import ProxyFix
from sqlalchemy import text

db = SQLAlchemy()
login_manager = LoginManager()
login_manager.login_view = 'auth.login'  # Route for @login_required
login_manager.login_message_category = 'info'

@login_manager.unauthorized_handler
def unauthorized():
    from flask import request, jsonify, redirect, url_for
    if request.path.startswith('/api/'):
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401
    return redirect(url_for('auth.login', next=request.path))
migrate = Migrate()

from flask_cors import CORS

def create_app(config_class=Config):
    app = Flask(__name__)
    CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)
    app.config.from_object(config_class)

    # If the app is running behind a proxy (like on Render), fix the WSGI environment
    if os.environ.get('RENDER'):
        app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1)
    
    # Set DEV_MODE from environment
    app.config['DEV_MODE'] = os.environ.get('DEV_MODE', 'False').lower() == 'true'
    if app.config['DEV_MODE']:
        print("\033[93m⚠️  Running in DEV_MODE - API calls will be stubbed!\033[0m")

    db.init_app(app)
    login_manager.init_app(app)
    migrate.init_app(app, db)

    # Initialize Redis connection for optional RQ background jobs
    try:
        redis_url = os.environ.get('REDIS_URL')
        if not redis_url:
            app.redis = None
            app.logger.info("REDIS_URL not set; using synchronous/free prototype mode.")
        else:
            # ssl_cert_reqs=None is important for managed services like Upstash/Render Redis
            app.redis = redis.from_url(redis_url, ssl_cert_reqs=None)
            app.logger.info("Redis connection for RQ initialized successfully.")
    except Exception as e:
        app.logger.error(f"Failed to initialize Redis connection: {e}")
        app.redis = None

    # Import and register blueprints
    from web_app.main_routes import bp as main_bp
    app.register_blueprint(main_bp)

    from web_app.auth_routes import bp as auth_bp
    app.register_blueprint(auth_bp, url_prefix='/auth')

    from web_app.api_endpoints import api_bp
    app.register_blueprint(api_bp)
    
    # Register new REST API Controllers
    try:
        from web_app.controllers.path_controller import path_bp
        from web_app.controllers.chat_controller import chat_bp
        from web_app.controllers.progress_controller import progress_bp
        from web_app.controllers.auth_controller import auth_bp
        from web_app.controllers.quiz_controller import quiz_bp
        app.register_blueprint(path_bp)
        app.register_blueprint(chat_bp)
        app.register_blueprint(progress_bp)
        app.register_blueprint(auth_bp)
        app.register_blueprint(quiz_bp)
    except ImportError as e:
        app.logger.warning(f"Could not load controllers yet: {e}")

    from web_app import models
    from flask import request
    
    @app.before_request
    def log_request_info():
        app.logger.info(f"Incoming {request.method} {request.path}")
        app.logger.info(f"Headers: {dict(request.headers)}")
    
    # Health endpoint for keep-alive (prevents Supabase auto-pause)
    @app.route('/health')
    def health():
        try:
            with app.app_context():
                with db.engine.connect() as conn:
                    conn.execute(text("SELECT 1"))
            return {"status": "ok", "db": "connected"}, 200
        except Exception as e:
            return {"status": "error", "db": str(e)}, 500

    @app.route('/api/metrics')
    def metrics():
        """Live platform metrics for the landing page."""
        try:
            from web_app.models import User, UserLearningPath
            total_users = db.session.query(User).count()
            total_paths = db.session.query(UserLearningPath).count()
            return {
                "success": True,
                "total_users": total_users,
                "total_paths": total_paths,
            }, 200
        except Exception as e:
            return {"success": False, "error": str(e)}, 500


    # Google OAuth blueprint (Flask-Dance)
    from web_app.google_oauth import google_bp, bp as google_auth_bp
    # Register Flask-Dance blueprint at /login/google
    app.register_blueprint(google_bp, url_prefix="/login")
    # Register our auth blueprint for callbacks and helper routes under /auth
    app.register_blueprint(google_auth_bp, url_prefix="/auth")
    
    # Flask-Dance will use session storage by default
    # This works better for our use case since we create the user in our callback

    return app
