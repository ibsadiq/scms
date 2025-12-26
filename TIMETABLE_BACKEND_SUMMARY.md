# Timetable Backend Implementation Summary

## Overview
The timetable (schedule) functionality is fully implemented with comprehensive conflict detection to prevent scheduling issues. The backend is located in `/home/abu/Projects/django-scms/schedule/`.

## 🔧 What Was Implemented

### 1. **Enhanced Period Model** ([schedule/models.py](../django-scms/schedule/models.py))

#### New Features Added:
- **Extended Day Choices**: Added Saturday and Sunday
- **Teacher Optional**: Teacher can now be null/blank (allows creating schedule before assigning teacher)
- **Additional Fields**:
  - `room_number`: Physical room location
  - `is_active`: Enable/disable periods without deleting
  - `notes`: Additional information about the period

#### **Conflict Detection** (Critical Feature):
The model now includes comprehensive validation in the `clean()` method that checks for:

1. **Time Validity**
   ```python
   if end_time <= start_time:
       raise ValidationError("End time must be after start time")
   ```

2. **Classroom Conflicts**
   - Prevents double-booking the same classroom
   - Checks for time overlaps on the same day
   - Error message shows conflicting time and subject

3. **Teacher Conflicts**
   - Prevents assigning a teacher to multiple classes at once
   - Checks for time overlaps on the same day
   - Error message shows conflicting classroom and subject

#### Example Conflict Detection:
```python
# Classroom conflict detection
classroom_conflicts = Period.objects.filter(
    classroom=self.classroom,
    day_of_week=self.day_of_week,
    is_active=True
).exclude(pk=self.pk)  # Exclude self when updating

for period in classroom_conflicts:
    # Check if times overlap
    if (self.start_time < period.end_time and self.end_time > period.start_time):
        raise ValidationError(
            f'Classroom conflict: {self.classroom} is already scheduled...'
        )
```

### 2. **Enhanced Serializers** ([schedule/serializers.py](../django-scms/schedule/serializers.py))

Created three specialized serializers:

#### `PeriodListSerializer`
- Used for listing/displaying periods
- Includes computed fields: `teacher_name`, `subject_name`, `classroom_name`
- Read-only nested data for better UI display

#### `PeriodCreateSerializer`
- Used for creating and updating periods
- Validates data before saving
- Calls `full_clean()` to trigger model validation
- Catches and properly formats ValidationErrors

#### `PeriodSerializer` (Legacy)
- Maintained for backward compatibility
- Used by existing code

### 3. **Enhanced Views** ([schedule/views.py](../django-scms/schedule/views.py))

#### `PeriodViewSet` (Main API)
Provides full CRUD operations with the following endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/timetable/` | List all periods |
| POST | `/api/timetable/` | Create new period (with conflict check) |
| GET | `/api/timetable/{id}/` | Get period details |
| PUT/PATCH | `/api/timetable/{id}/` | Update period (with conflict check) |
| DELETE | `/api/timetable/{id}/` | Delete period |
| POST | `/api/timetable/check_conflicts/` | Check conflicts without saving |
| GET | `/api/timetable/by_classroom/?classroom=1` | Get all periods for a classroom |
| GET | `/api/timetable/by_teacher/?teacher=1` | Get all periods for a teacher |

#### Special Features:

**1. Conflict Checking Endpoint** (`/check_conflicts/`)
- Check for conflicts before saving
- Returns detailed conflict information
- Useful for frontend validation

Request Example:
```json
POST /api/timetable/check_conflicts/
{
    "classroom": 1,
    "teacher": 2,
    "day_of_week": "Monday",
    "start_time": "09:00",
    "end_time": "10:00",
    "exclude_id": 5  // Optional: for updates
}
```

Response (with conflicts):
```json
{
    "has_conflicts": true,
    "conflicts": [
        {
            "type": "classroom",
            "message": "Classroom is already scheduled from 09:00 to 10:00",
            "period_id": 3,
            "subject": "Mathematics"
        }
    ]
}
```

**2. Filtered Queries**
- `by_classroom`: Get all periods for a specific classroom
- `by_teacher`: Get all periods for a specific teacher
- Useful for displaying teacher/classroom schedules

### 4. **Assessment Models** (Already Exist in [examination/models.py](../django-scms/examination/models.py))

The system already has comprehensive assessment models:

- **`ExaminationListHandler`**: Exam/assessment metadata
- **`MarksManagement`**: Individual student marks/grades
- **`GradeScale`** & **`GradeScaleRule`**: Grading schemes

## 🛡️ Conflict Prevention System

### How It Works:

1. **Database Level**:
   - `unique_together = ("day_of_week", "start_time", "classroom")`
   - Prevents exact duplicates at DB level

2. **Model Level** (`clean()` method):
   - Checks for overlapping time periods
   - Validates both classroom and teacher availability
   - Runs automatically when `save()` is called

3. **Serializer Level**:
   - Additional validation in serializer
   - Calls `full_clean()` before saving
   - Catches and formats errors for API response

4. **View Level**:
   - Proper error handling
   - Returns user-friendly error messages
   - Provides `check_conflicts` endpoint for pre-validation

### Example Workflow:

```
User creates period: Monday 9:00-10:00, Classroom A, Teacher X
                                ↓
          Serializer validates basic data
                                ↓
          Calls model.full_clean()
                                ↓
          Model.clean() checks for conflicts:
          - Is classroom A free Monday 9:00-10:00?
          - Is teacher X free Monday 9:00-10:00?
                                ↓
          If conflict found → raise ValidationError
                                ↓
          View catches error → returns 400 with details
```

## 📋 Frontend Integration Points

Your frontend timetable page at `/home/abu/Projects/scms/app/pages/admin/timetable/index.vue` should use these endpoints:

### 1. Fetch All Periods
```typescript
const { data } = await apiCall<Schedule[]>('/academic/timetable/')
```

**Note**: The frontend currently uses `/academic/timetable/`, but the Django backend serves from `/api/timetable/`. Ensure your API proxy or URL configuration maps these correctly.

### 2. Create Period with Conflict Handling
```typescript
try {
    const { data, error } = await apiCall('/academic/timetable/', {
        method: 'POST',
        body: JSON.stringify(formData)
    })

    if (error) {
        // Display conflict error to user
        toast.error(error)
    }
} catch (e) {
    // Handle validation errors
}
```

### 3. Check Conflicts Before Saving (Optional)
```typescript
const checkConflict = async () => {
    const { data } = await apiCall('/academic/timetable/check_conflicts/', {
        method: 'POST',
        body: JSON.stringify({
            classroom: formData.classroom,
            teacher: formData.teacher,
            day_of_week: formData.day_of_week,
            start_time: formData.start_time,
            end_time: formData.end_time
        })
    })

    if (data.has_conflicts) {
        // Show warnings to user
        conflicts.value = data.conflicts
    }
}
```

## 🚀 Migration Required

Since we added new fields to the Period model, you need to run migrations:

```bash
cd /home/abu/Projects/django-scms
python manage.py makemigrations schedule
python manage.py migrate schedule
```

## ✅ Testing Conflict Detection

### Test Case 1: Classroom Conflict
```python
# Create first period
Period.objects.create(
    classroom=classroom_a,
    day_of_week="Monday",
    start_time="09:00",
    end_time="10:00",
    subject=math_subject,
    teacher=teacher_x
)

# Try to create overlapping period (should fail)
Period.objects.create(
    classroom=classroom_a,  # Same classroom
    day_of_week="Monday",   # Same day
    start_time="09:30",     # Overlaps!
    end_time="10:30",
    subject=english_subject,
    teacher=teacher_y
)
# Raises: ValidationError - Classroom conflict
```

### Test Case 2: Teacher Conflict
```python
# Try to assign same teacher to different classroom at same time
Period.objects.create(
    classroom=classroom_b,  # Different classroom
    day_of_week="Monday",
    start_time="09:00",     # Same time
    end_time="10:00",
    subject=science_subject,
    teacher=teacher_x       # Same teacher - conflict!
)
# Raises: ValidationError - Teacher conflict
```

### Test Case 3: No Conflict
```python
# This should work fine
Period.objects.create(
    classroom=classroom_a,
    day_of_week="Monday",
    start_time="10:00",     # After previous period
    end_time="11:00",
    subject=history_subject,
    teacher=teacher_x
)
# Success!
```

## 📝 Summary of Changes

### Files Modified:
1. **`/home/abu/Projects/django-scms/schedule/models.py`**
   - Added conflict detection in `clean()` method
   - Added new fields: `room_number`, `is_active`, `notes`
   - Made teacher optional
   - Added Saturday/Sunday to days

2. **`/home/abu/Projects/django-scms/schedule/serializers.py`**
   - Created `PeriodListSerializer` for display
   - Created `PeriodCreateSerializer` for create/update with validation
   - Maintained backward compatibility

3. **`/home/abu/Projects/django-scms/schedule/views.py`**
   - Enhanced `PeriodViewSet` with conflict handling
   - Added `check_conflicts` endpoint
   - Added `by_classroom` and `by_teacher` filters
   - Improved error responses

### Key Features:
✅ **Automatic conflict detection** for classrooms and teachers
✅ **Time overlap validation**
✅ **Pre-save conflict checking endpoint**
✅ **Detailed error messages** showing what conflicts
✅ **Backward compatible** with existing code
✅ **Optimized queries** with select_related
✅ **RESTful API** with full CRUD operations

## 🔗 API Endpoints Summary

```
GET    /api/timetable/                        - List all periods
POST   /api/timetable/                        - Create period
GET    /api/timetable/{id}/                   - Get period details
PUT    /api/timetable/{id}/                   - Update period
DELETE /api/timetable/{id}/                   - Delete period
POST   /api/timetable/check_conflicts/        - Check conflicts
GET    /api/timetable/by_classroom/?classroom=1  - Filter by classroom
GET    /api/timetable/by_teacher/?teacher=1      - Filter by teacher
```

## 🎯 Next Steps

1. **Run migrations** to apply model changes
2. **Update frontend** to use conflict checking endpoint
3. **Add user feedback** for conflicts in the UI
4. **Test thoroughly** with overlapping schedules
5. **Consider adding**:
   - Bulk import/export functionality
   - Copy schedule from previous term
   - Schedule templates
   - Visual conflict indicators in grid view

---

**Status**: ✅ **Fully Implemented with Conflict Detection**

All timetable backend functionality is in place with comprehensive validation to prevent scheduling conflicts!
