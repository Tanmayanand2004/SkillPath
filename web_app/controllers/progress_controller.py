import datetime
from flask import Blueprint, request, jsonify, current_app
from web_app.jwt_utils import jwt_required
from web_app.models import db, LearningProgress, UserLearningPath

progress_bp = Blueprint('progress_api', __name__, url_prefix='/api/progress')

@progress_bp.route('/save', methods=['POST'])
@jwt_required
def save_progress(current_user):
    try:
        data = request.get_json()
        path_id = data.get('path_id')
        milestone_identifier = data.get('milestone_identifier')
        status = data.get('status', 'not_started')

        if not path_id or not milestone_identifier:
            return jsonify({'success': False, 'message': 'Missing required fields'}), 400

        user_path = UserLearningPath.query.filter_by(id=path_id, user_id=current_user.id).first()
        if not user_path:
            return jsonify({'success': False, 'message': 'Path not found'}), 404

        progress = LearningProgress.query.filter_by(user_learning_path_id=path_id, milestone_identifier=milestone_identifier).first()
        if not progress:
            progress = LearningProgress(user_learning_path_id=path_id, milestone_identifier=milestone_identifier)
            db.session.add(progress)

        progress.status = status
        if status == 'in_progress' and not progress.started_at:
            progress.started_at = datetime.datetime.utcnow()
        elif status == 'completed':
            progress.completed_at = datetime.datetime.utcnow()
            if not progress.started_at:
                progress.started_at = datetime.datetime.utcnow()
        elif status == 'not_started':
            progress.started_at = None
            progress.completed_at = None

        db.session.commit()
        return jsonify({'success': True, 'data': {'status': status}})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'message': str(e)}), 500

@progress_bp.route('/load/<path_id>', methods=['GET'])
@jwt_required
def load_progress(path_id, current_user):
    try:
        progress_records = LearningProgress.query.filter_by(user_learning_path_id=path_id).all()
        return jsonify({
            'success': True,
            'data': {p.milestone_identifier: p.status for p in progress_records}
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
