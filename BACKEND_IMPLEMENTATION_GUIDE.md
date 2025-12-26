# Backend Implementation Guide - Teacher Features

This guide explains what backend endpoints need to be implemented for the teacher portal features to work.

---

## 🚀 Quick Start - Frontend Testing

**The frontend is now working with MOCK DATA!** You can test all features immediately:

1. Navigate to `/teacher/classes` - See homeroom and teaching classes
2. Navigate to `/teacher/attendance` - Mark attendance (saves to console)
3. All data is simulated, no backend needed for testing

### Disable Mock Data

When your backend is ready, set `USE_MOCK_DATA = false` in these files:
- `/composables/teacher/useClasses.ts` (line 134)
- `/composables/teacher/useAttendance.ts` (line 28)

---

## 📡 Required Backend Endpoints

### 1. **Get Teacher's Assigned Classes**

**Endpoint:** `GET /api/academic/allocated-subjects/my-classes/`

**Purpose:** Returns all classes assigned to the logged-in teacher (both homeroom and teaching assignments)

**Authentication:** Required (Bearer token)

**Response:**
```json
[
  {
    "id": 1,
    "classroom_id": 101,
    "classroom_name": "JSS 2A",
    "subject_name": "Mathematics",
    "grade_level_name": "JSS 2",
    "student_count": 35,
    "is_class_teacher": true,
    "schedule": [
      {
        "day": "Monday",
        "start_time": "08:00:00",
        "end_time": "09:00:00"
      },
      {
        "day": "Wednesday",
        "start_time": "10:00:00",
        "end_time": "11:00:00"
      }
    ]
  },
  {
    "id": 2,
    "classroom_id": 102,
    "classroom_name": "JSS 2B",
    "subject_name": "Mathematics",
    "grade_level_name": "JSS 2",
    "student_count": 32,
    "is_class_teacher": false,
    "schedule": [...]
  }
]
```

**Django Implementation Example:**

```python
# In your views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_teacher_classes(request):
    """Get all classes assigned to the logged-in teacher"""
    teacher = request.user.teacher_profile  # Adjust based on your model structure

    # Get subject allocations
    allocations = SubjectAllocation.objects.filter(
        teacher=teacher,
        is_active=True
    ).select_related('classroom', 'subject', 'classroom__grade_level')

    classes = []
    for allocation in allocations:
        # Get schedule for this allocation
        schedule = TimetableEntry.objects.filter(
            subject_allocation=allocation
        ).values('day_of_week', 'start_time', 'end_time')

        classes.append({
            'id': allocation.id,
            'classroom_id': allocation.classroom.id,
            'classroom_name': allocation.classroom.name,
            'subject_name': allocation.subject.name,
            'grade_level_name': allocation.classroom.grade_level.name,
            'student_count': allocation.classroom.students.filter(is_active=True).count(),
            'is_class_teacher': allocation.classroom.class_teacher == teacher,
            'schedule': [
                {
                    'day': entry['day_of_week'],
                    'start_time': entry['start_time'],
                    'end_time': entry['end_time']
                }
                for entry in schedule
            ]
        })

    return Response(classes)

# In your urls.py
urlpatterns = [
    path('academic/allocated-subjects/my-classes/', get_teacher_classes),
]
```

---

### 2. **Get Students in a Classroom**

**Endpoint:** `GET /api/academic/classrooms/{classroom_id}/students/`

**Purpose:** Returns all students enrolled in a specific classroom

**Authentication:** Required (Bearer token)

**Response:**
```json
[
  {
    "id": 1,
    "admission_number": "ADM001",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@school.com",
    "phone": "08012345678",
    "photo": "/media/students/john.jpg",
    "status": "active",
    "grade_level_name": "JSS 2"
  },
  {
    "id": 2,
    "admission_number": "ADM002",
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "jane.smith@school.com",
    "status": "active",
    "grade_level_name": "JSS 2"
  }
]
```

**Django Implementation Example:**

```python
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_classroom_students(request, classroom_id):
    """Get all students in a classroom"""
    try:
        classroom = Classroom.objects.get(id=classroom_id)

        # Verify teacher has access to this classroom
        teacher = request.user.teacher_profile
        has_access = (
            classroom.class_teacher == teacher or
            SubjectAllocation.objects.filter(
                teacher=teacher,
                classroom=classroom,
                is_active=True
            ).exists()
        )

        if not has_access:
            return Response(
                {'error': 'You do not have access to this classroom'},
                status=403
            )

        students = classroom.students.filter(is_active=True).values(
            'id', 'admission_number', 'first_name', 'last_name',
            'email', 'phone', 'photo', 'status'
        )

        return Response(list(students))

    except Classroom.DoesNotExist:
        return Response({'error': 'Classroom not found'}, status=404)

# In your urls.py
urlpatterns = [
    path('academic/classrooms/<int:classroom_id>/students/', get_classroom_students),
]
```

---

### 3. **Bulk Mark Attendance**

**Endpoint:** `POST /api/attendance/student-attendance/bulk-mark/`

**Purpose:** Mark attendance for multiple students at once

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "classroom": 101,
  "date": "2025-11-24",
  "records": [
    {
      "student": 1,
      "status": "Present",
      "remarks": ""
    },
    {
      "student": 2,
      "status": "Absent",
      "remarks": "Sick"
    },
    {
      "student": 3,
      "status": "Late",
      "remarks": "Arrived at 8:30"
    },
    {
      "student": 4,
      "status": "Excused",
      "remarks": "Medical appointment"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Attendance marked for 4 students",
  "created": 4,
  "updated": 0
}
```

**Django Implementation Example:**

```python
from django.db import transaction

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bulk_mark_attendance(request):
    """Mark attendance for multiple students"""
    classroom_id = request.data.get('classroom')
    date = request.data.get('date')
    records = request.data.get('records', [])

    teacher = request.user.teacher_profile

    try:
        classroom = Classroom.objects.get(id=classroom_id)

        # Verify teacher has access
        has_access = (
            classroom.class_teacher == teacher or
            SubjectAllocation.objects.filter(
                teacher=teacher,
                classroom=classroom,
                is_active=True
            ).exists()
        )

        if not has_access:
            return Response({'error': 'Access denied'}, status=403)

        created_count = 0
        updated_count = 0

        with transaction.atomic():
            for record in records:
                attendance, created = Attendance.objects.update_or_create(
                    student_id=record['student'],
                    date=date,
                    classroom=classroom,
                    defaults={
                        'status': record['status'],
                        'remarks': record.get('remarks', ''),
                        'marked_by': teacher
                    }
                )

                if created:
                    created_count += 1
                else:
                    updated_count += 1

        return Response({
            'success': True,
            'message': f'Attendance marked for {len(records)} students',
            'created': created_count,
            'updated': updated_count
        })

    except Classroom.DoesNotExist:
        return Response({'error': 'Classroom not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=400)

# In your urls.py
urlpatterns = [
    path('attendance/student-attendance/bulk-mark/', bulk_mark_attendance),
]
```

---

## 📊 Database Models (Reference)

Your Django models should include these key fields:

### SubjectAllocation Model
```python
class SubjectAllocation(models.Model):
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
```

### Classroom Model
```python
class Classroom(models.Model):
    name = models.CharField(max_length=50)  # e.g., "JSS 2A"
    grade_level = models.ForeignKey(GradeLevel, on_delete=models.CASCADE)
    class_teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True)
    is_active = models.BooleanField(default=True)
```

### Attendance Model
```python
class Attendance(models.Model):
    STATUS_CHOICES = [
        ('Present', 'Present'),
        ('Absent', 'Absent'),
        ('Late', 'Late'),
        ('Excused', 'Excused')
    ]

    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE)
    date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    remarks = models.TextField(blank=True)
    marked_by = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['student', 'date', 'classroom']
        indexes = [
            models.Index(fields=['date', 'classroom']),
            models.Index(fields=['student', 'date']),
        ]
```

---

## 🔒 Security Considerations

### 1. **Authentication**
- All endpoints require authentication (Bearer token)
- Verify JWT token on each request

### 2. **Authorization**
- Teachers can only access their assigned classes
- Teachers can only mark attendance for students in their classes
- Check if teacher is class_teacher OR has subject allocation

### 3. **Data Validation**
- Validate date format (YYYY-MM-DD)
- Validate attendance status (Present, Absent, Late, Excused)
- Validate student exists and is enrolled in classroom
- Prevent duplicate attendance entries (use unique_together)

### 4. **Error Handling**
Return appropriate HTTP status codes:
- `200` - Success
- `400` - Bad request (validation error)
- `401` - Unauthorized (no/invalid token)
- `403` - Forbidden (teacher doesn't have access)
- `404` - Not found (classroom/student doesn't exist)
- `500` - Server error

---

## 🧪 Testing the Backend

### Test Endpoint 1: Get Teacher Classes
```bash
curl -X GET http://localhost:8000/api/academic/allocated-subjects/my-classes/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test Endpoint 2: Get Classroom Students
```bash
curl -X GET http://localhost:8000/api/academic/classrooms/101/students/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test Endpoint 3: Mark Attendance
```bash
curl -X POST http://localhost:8000/api/attendance/student-attendance/bulk-mark/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "classroom": 101,
    "date": "2025-11-24",
    "records": [
      {"student": 1, "status": "Present", "remarks": ""},
      {"student": 2, "status": "Absent", "remarks": "Sick"}
    ]
  }'
```

---

## ✅ Implementation Checklist

- [ ] Create `SubjectAllocation` model (if not exists)
- [ ] Create `Attendance` model with unique constraint
- [ ] Add `class_teacher` field to `Classroom` model
- [ ] Implement `GET /api/academic/allocated-subjects/my-classes/`
- [ ] Implement `GET /api/academic/classrooms/{id}/students/`
- [ ] Implement `POST /api/attendance/student-attendance/bulk-mark/`
- [ ] Add authentication middleware
- [ ] Add authorization checks (teacher access verification)
- [ ] Add input validation
- [ ] Test all endpoints with Postman/curl
- [ ] Update frontend composables: Set `USE_MOCK_DATA = false`
- [ ] Test frontend with real backend

---

## 🎯 Summary

**Frontend Status:** ✅ Complete with mock data
**Backend Status:** ⚠️ Needs implementation

**Current Behavior:**
- Teachers can view mock classes with homeroom distinction
- Teachers can mark attendance (saves to browser console)
- All features are fully functional for UI/UX testing

**Next Steps:**
1. Implement the 3 backend endpoints above
2. Test endpoints with Postman/curl
3. Disable mock data in frontend composables
4. Test full integration

---

**Questions?** Check the mock data in these files to see expected formats:
- `/composables/teacher/useClasses.ts` (lines 32-98)
- `/composables/teacher/useAttendance.ts` (lines 44-47)
