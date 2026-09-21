from shared_services.audit.service import log_action

class NotificationService:
    def send_in_app(self, user, title, message, action_url=None):
        log_action(
            actor=None,
            action="NOTIFICATION_SENT",
            entity_type="user",
            entity_id=str(user.id),
            metadata={"type": "in_app", "title": title, "message": message}
        )
        return True

    def send_email(self, to_email, subject, body, template=None):
        log_action(
            actor=None,
            action="NOTIFICATION_SENT",
            entity_type="email",
            entity_id=to_email,
            metadata={"type": "email", "subject": subject}
        )
        return True

    def send_whatsapp_stub(self, phone, message):
        log_action(
            actor=None,
            action="NOTIFICATION_SENT",
            entity_type="phone",
            entity_id=phone,
            metadata={"type": "whatsapp", "message": message}
        )
        return True
