# Backend Changes Required: Remove Streams Feature

## Overview
The Streams feature has been removed from the frontend as it was not being utilized. This document outlines the necessary backend changes in `/home/abu/Projects/django-scms`.

---

## Changes Required in Django Backend

### 1. Update Classroom Model
**File**: `academic/models.py` or similar

**Remove the stream field** from the Classroom model:

```python
class Classroom(models.Model):
    name = models.CharField(max_length=100)
    # stream = models.ForeignKey(Stream, on_delete=models.SET_NULL, null=True)  # ← REMOVE THIS
    # stream_name - remove if exists
    class_teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True, blank=True)
    capacity = models.IntegerField()
    occupied_sits = models.IntegerField(default=0)
    available_sits = models.IntegerField()
    class_status = models.CharField(max_length=20)
    grade_level = models.ForeignKey(GradeLevel, on_delete=models.SET_NULL, null=True, blank=True)
    class_level = models.ForeignKey(ClassLevel, on_delete=models.SET_NULL, null=True, blank=True)
```

### 2. Remove Stream Model (Optional)
**File**: `academic/models.py` or similar

If you want to completely remove the Stream model:

```python
# DELETE THIS ENTIRE MODEL
# class Stream(models.Model):
#     name = models.CharField(max_length=50)
#
#     def __str__(self):
#         return self.name
```

### 3. Update Classroom Serializer
**File**: `academic/serializers.py` or similar

**Remove stream fields**:

```python
class ClassroomSerializer(serializers.ModelSerializer):
    class_teacher_name = serializers.CharField(source='class_teacher.get_full_name', read_only=True)
    # stream_name = serializers.CharField(source='stream.name', read_only=True)  # ← REMOVE THIS

    class Meta:
        model = Classroom
        fields = [
            'id', 'name',
            # 'stream', 'stream_name',  # ← REMOVE THESE
            'class_teacher', 'class_teacher_name',
            'capacity', 'occupied_sits', 'available_sits',
            'class_status', 'grade_level', 'class_level'
        ]
```

### 4. Remove Stream ViewSet/API Endpoints (Optional)
**File**: `academic/views.py` or similar

```python
# DELETE THIS ENTIRE VIEWSET
# class StreamViewSet(viewsets.ModelViewSet):
#     queryset = Stream.objects.all()
#     serializer_class = StreamSerializer
#     permission_classes = [IsAuthenticated]
```

### 5. Remove Stream URL Routes (Optional)
**File**: `academic/urls.py` or similar

```python
# router.register(r'streams', StreamViewSet, basename='stream')  # ← REMOVE THIS
```

### 6. Create and Run Migrations

After making the model changes, create and run migrations:

```bash
cd /home/abu/Projects/django-scms

# Create migration to remove stream field
python manage.py makemigrations

# Apply migration
python manage.py migrate
```

**Important**: The migration will prompt you about data loss if there's existing stream data. You can:
- Provide a default value
- Allow NULL values temporarily
- Or manually migrate data if needed

### 7. Update Admin Panel (Optional)
**File**: `academic/admin.py`

Remove Stream from admin if it exists:

```python
# from .models import Stream  # ← REMOVE IMPORT
# admin.site.register(Stream)  # ← REMOVE REGISTRATION
```

Update ClassroomAdmin to remove stream field:

```python
@admin.register(Classroom)
class ClassroomAdmin(admin.ModelAdmin):
    list_display = ['name', 'class_teacher', 'capacity', 'class_status']  # Remove 'stream' if present
    # list_filter = ['stream', 'class_status']  # Remove 'stream' from filters
    search_fields = ['name', 'class_teacher__first_name', 'class_teacher__last_name']
```

---

## Migration Strategy

### Option A: Complete Removal (Recommended if Stream was never used)
1. Remove Stream model completely
2. Remove stream foreign key from Classroom
3. Run migrations
4. Clean up serializers, views, and URLs

### Option B: Keep Model but Deprecate (If data exists)
1. Keep Stream model but mark as deprecated
2. Make stream field nullable in Classroom: `stream = models.ForeignKey(Stream, null=True, blank=True)`
3. Stop using it in frontend (already done)
4. Remove later after data migration

---

## Testing After Changes

1. **Test Classroom API**:
   ```bash
   # GET all classrooms
   curl http://localhost:8000/api/academic/classrooms/

   # POST new classroom (without stream)
   curl -X POST http://localhost:8000/api/academic/classrooms/ \
     -H "Content-Type: application/json" \
     -d '{"name": "JSS 2A", "capacity": 40, "occupied_sits": 0}'
   ```

2. **Verify Frontend Integration**:
   - Check classroom list loads correctly
   - Verify classroom creation works
   - Confirm classroom details display properly

3. **Check Admin Panel**:
   - Ensure Streams is removed from navigation
   - Verify classroom forms work without stream field

---

## Rollback Plan

If you need to rollback:

1. Restore the Stream model
2. Restore stream field in Classroom model
3. Run migrations to recreate fields
4. Restore stream-related views and serializers
5. Re-add frontend pages from git history

---

## Summary of Frontend Changes (Already Completed)

✅ Removed `/app/pages/admin/streams/` directory
✅ Removed `Stream` interface from `types/index.ts`
✅ Removed `stream` and `stream_name` from `Classroom` interface
✅ Updated classroom list view to show teacher instead of stream
✅ Updated classroom detail view to show teacher instead of stream
✅ Removed stream from classroom search filter
✅ Removed "Streams" link from admin sidebar
✅ Updated classroom creation note

---

## Questions?

If you have any questions about these changes, check:
- Django model relationships
- Migration strategies: https://docs.djangoproject.com/en/stable/topics/migrations/
- How to handle foreign key removal with existing data
