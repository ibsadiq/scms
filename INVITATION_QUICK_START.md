# Invitation System - Quick Start Guide

## 🚀 For Admins

### Creating a Teacher/Parent with Invitation

1. Go to **Teachers** or **Parents** section
2. Click **"Create New"**
3. Fill in the form (name, email, phone, etc.)
4. Make sure **"Send invitation email"** is checked ✓ (it's checked by default)
5. Click **"Send Invitation"**
6. Done! The teacher/parent will receive an invitation link

### Managing Invitations

On any teacher/parent detail page, you'll see an **Invitation Status Card** if they were invited:

```
┌─────────────────────────────────┐
│  📧 Account Invitation          │
├─────────────────────────────────┤
│  Status: Pending                │
│  Invitation sent: 10 Jan 2025   │
│  ⏰ Expires in 6 day(s)         │
│                                 │
│  [Resend] [Copy Link]           │
└─────────────────────────────────┘
```

**Actions:**
- **Resend** - Sends another invitation email (when email is configured)
- **Copy Link** - Copies the invitation URL to share manually

---

## 👥 For Teachers/Parents

### Setting Up Your Account

1. **Check your email** for an invitation from the school
2. **Click the invitation link** (or paste it in your browser)
3. You'll see: **"Welcome, [Your Name]! Set up your account"**
4. **Create a password:**
   - Minimum 8 characters
   - Enter it twice to confirm
5. Click **"Create Account"**
6. Done! You'll be automatically logged in to your dashboard

### If Your Link Expired

Contact your school administrator - they can:
- Resend the invitation (which generates a new link)
- Or share the invitation link directly with you

---

## ⚙️ System Configuration (For Developers)

### Email Setup Required

To send invitation emails, configure Django email settings in `settings.py`:

```python
# Email Configuration
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'  # Your SMTP server
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-email@gmail.com'
EMAIL_HOST_PASSWORD = 'your-app-password'
DEFAULT_FROM_EMAIL = 'School Name <noreply@school.com>'
```

### Then Update These Files

1. **Create email template** at `users/templates/emails/invitation.html`
2. **Implement email sending** in `users/serializers.py` (search for `TODO: Send invitation email`)
3. **Implement resend email** in `users/views.py` (search for `TODO: Implement email sending logic`)

**Example email sending code:**

```python
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings

def send_invitation_email(invitation):
    """Send invitation email to user"""
    context = {
        'first_name': invitation.first_name,
        'invitation_link': f"{settings.FRONTEND_URL}/setup-account?token={invitation.token}",
        'expiry_days': invitation.days_until_expiry,
        'role': invitation.get_role_display(),
    }

    subject = f'Invitation to join {settings.SCHOOL_NAME}'
    html_message = render_to_string('emails/invitation.html', context)

    send_mail(
        subject=subject,
        message='',  # Plain text fallback
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[invitation.email],
        html_message=html_message,
        fail_silently=False,
    )
```

---

## 🔍 Testing the System

### Manual Testing Checklist

**Backend:**
- [ ] Create teacher with `send_invitation=true`
- [ ] Check UserInvitation record created in database
- [ ] Verify token is 64 characters
- [ ] Confirm expires_at is 7 days from now
- [ ] Test `/api/users/invitations/validate/{token}/` endpoint

**Frontend:**
- [ ] Create teacher with invitation checkbox
- [ ] See invitation card on teacher detail page
- [ ] Copy invitation link
- [ ] Open link in new browser (incognito)
- [ ] Complete account setup
- [ ] Verify auto-login works
- [ ] Check user redirected to /teacher dashboard

**Edge Cases:**
- [ ] Try using expired token (should fail)
- [ ] Try using same token twice (should fail)
- [ ] Try creating account with existing email (should fail)
- [ ] Resend invitation (should work)

---

## 📊 Database Queries

### View all pending invitations
```python
from users.models import UserInvitation

# Get all pending invitations
pending = UserInvitation.objects.filter(status='pending')

# Get pending teacher invitations
teachers = UserInvitation.objects.filter(role='teacher', status='pending')

# Get expired invitations
expired = UserInvitation.objects.filter(status='pending', expires_at__lt=timezone.now())
```

### Check invitation status for a teacher
```python
from academic.models import Teacher
from users.models import UserInvitation

teacher = Teacher.objects.get(id=1)
invitation = UserInvitation.objects.filter(
    teacher_profile_id=teacher.id,
    status='pending'
).first()

if invitation:
    print(f"Invitation: {invitation.token}")
    print(f"Valid: {invitation.is_valid()}")
    print(f"Days left: {invitation.days_until_expiry}")
```

---

## 🐛 Troubleshooting

### "Invalid invitation token"
- Token might be expired (7 days limit)
- Token might be already used
- Admin can resend invitation from detail page

### "Invitation checkbox not working"
- Check browser console for errors
- Verify backend received `send_invitation: true`
- Check database for UserInvitation record

### "Email not received"
- Email service not configured (see Email Setup above)
- Check spam folder
- Use "Copy Link" feature to share manually

### "Account created but not linked to profile"
- Check invitation has correct profile_id
- Verify role matches (teacher/parent)
- Check AcceptInvitationSerializer logic

---

## 📈 Monitoring

### Track invitation metrics

```python
from django.utils import timezone
from users.models import UserInvitation

# Acceptance rate
total = UserInvitation.objects.count()
accepted = UserInvitation.objects.filter(status='accepted').count()
rate = (accepted / total * 100) if total > 0 else 0
print(f"Acceptance rate: {rate:.1f}%")

# Average acceptance time
accepted_invitations = UserInvitation.objects.filter(
    status='accepted',
    accepted_at__isnull=False
)
for inv in accepted_invitations:
    delta = inv.accepted_at - inv.created_at
    print(f"{inv.email}: {delta.days} days")

# Expired invitations needing cleanup
expired = UserInvitation.objects.filter(
    status='pending',
    expires_at__lt=timezone.now()
)
print(f"Expired invitations: {expired.count()}")
```

---

## 🎯 Best Practices

1. **Always use invitations for new staff**
   - More secure than default passwords
   - Better user experience

2. **Monitor expired invitations**
   - Set up weekly cleanup task
   - Alert admins about pending invitations

3. **Keep invitation validity short**
   - 7 days is reasonable
   - Prevents security issues

4. **Customize email templates**
   - Add school branding
   - Include contact information
   - Make it welcoming

5. **Track invitation status**
   - Know who hasn't activated
   - Follow up if needed

---

## 🔗 Related Files

- **Backend Logic:** `django-scms/users/invitation_models.py`
- **API Endpoints:** `django-scms/users/views.py` (lines 723-851)
- **Frontend Setup Page:** `scms/app/pages/setup-account.vue`
- **Teacher Create:** `scms/app/pages/admin/teachers/create.vue`
- **Parent Create:** `scms/app/pages/admin/parents/create.vue`

---

## 💬 Support

Questions? Check:
- Full documentation: `INVITATION_SYSTEM_COMPLETE.md`
- Summary: `INVITATION_SYSTEM_SUMMARY.md`
- Code comments in the files above

Happy inviting! 🎉
