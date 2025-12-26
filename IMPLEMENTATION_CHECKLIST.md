# Django Financial Module - Implementation Checklist

## Files to Copy

Copy these files to your Django `financial` app:

### ✅ Step 1: Copy Model Files

```bash
# Copy models
cp backend_models_clean.py your_project/financial/models.py

# Copy serializers
cp backend_serializers_clean.py your_project/financial/serializers.py

# Copy views
cp backend_views_clean.py your_project/financial/views.py

# Copy URLs
cp backend_urls_clean.py your_project/financial/urls.py

# Copy signals (FIXED VERSION)
cp backend_signals_fixed.py your_project/financial/signals.py

# Copy admin
cp backend_admin.py your_project/financial/admin.py
```

---

## ✅ Step 2: Update `financial/apps.py`

```python
from django.apps import AppConfig

class FinancialConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'financial'

    def ready(self):
        import financial.signals  # Enable auto-assignment
```

---

## ✅ Step 3: Update Main `settings.py`

Make sure `financial` app is in `INSTALLED_APPS`:

```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Your apps
    'users',
    'administration',
    'academic',
    'financial',  # ← Make sure this is here

    # Third party
    'rest_framework',
    'corsheaders',
    # ...
]
```

---

## ✅ Step 4: Update Main `urls.py`

```python
# your_project/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),

    # API endpoints
    path('api/users/', include('users.urls')),
    path('api/administration/', include('administration.urls')),
    path('api/academic/', include('academic.urls')),
    path('api/financial/', include('financial.urls')),  # ← Add this

    # Other URLs
]
```

---

## ✅ Step 5: Create and Run Migrations

```bash
# Create migrations for financial app
python manage.py makemigrations financial

# Review the migration file (optional but recommended)
cat financial/migrations/0001_initial.py

# Apply migrations
python manage.py migrate financial

# If there are issues, you can reset:
# python manage.py migrate financial zero
# python manage.py makemigrations financial
# python manage.py migrate financial
```

---

## ✅ Step 6: Create Initial Data

### Option A: Via Django Shell

```bash
python manage.py shell
```

```python
from financial.models import PaymentCategory

# Create payment categories for outgoing payments
PaymentCategory.objects.create(
    name="Salary",
    abbr="SAL",
    description="Teacher and staff salaries"
)

PaymentCategory.objects.create(
    name="Utilities",
    abbr="UTIL",
    description="Electricity, water, internet"
)

PaymentCategory.objects.create(
    name="Maintenance",
    abbr="MAINT",
    description="Building and equipment maintenance"
)

PaymentCategory.objects.create(
    name="Supplies",
    abbr="SUPP",
    description="Office supplies, cleaning supplies"
)

PaymentCategory.objects.create(
    name="Transport",
    abbr="TRANS",
    description="Fuel, bus maintenance"
)

print("✅ Payment categories created!")
```

### Option B: Via Data Migration (Recommended)

Create a data migration:

```bash
python manage.py makemigrations --empty financial --name create_payment_categories
```

Edit the migration file:

```python
# financial/migrations/000X_create_payment_categories.py
from django.db import migrations

def create_payment_categories(apps, schema_editor):
    PaymentCategory = apps.get_model('financial', 'PaymentCategory')

    categories = [
        {'name': 'Salary', 'abbr': 'SAL', 'description': 'Teacher and staff salaries'},
        {'name': 'Utilities', 'abbr': 'UTIL', 'description': 'Electricity, water, internet'},
        {'name': 'Maintenance', 'abbr': 'MAINT', 'description': 'Building and equipment maintenance'},
        {'name': 'Supplies', 'abbr': 'SUPP', 'description': 'Office supplies'},
        {'name': 'Transport', 'abbr': 'TRANS', 'description': 'Fuel, bus maintenance'},
    ]

    for cat_data in categories:
        PaymentCategory.objects.create(**cat_data)

class Migration(migrations.Migration):
    dependencies = [
        ('financial', '000X_previous_migration'),
    ]

    operations = [
        migrations.RunPython(create_payment_categories),
    ]
```

Run migration:
```bash
python manage.py migrate financial
```

---

## ✅ Step 7: Test the API

### Start Development Server

```bash
python manage.py runserver
```

### Test Endpoints

```bash
# Get all fee structures
curl http://localhost:8000/api/finance/fee-structures/

# Get payment categories
curl http://localhost:8000/api/financial/payment-categories/

# Get student balance
curl http://localhost:8000/api/financial/student-balance/1/
```

---

## ✅ Step 8: Test Django Admin

1. Create superuser (if you haven't already):
   ```bash
   python manage.py createsuperuser
   ```

2. Login to admin:
   ```
   http://localhost:8000/admin/
   ```

3. You should see:
   - Fee Structures
   - Student Fee Assignments
   - Receipts
   - Payments
   - Payment Categories
   - Fee Adjustments
   - Fee Payment Allocations

---

## ✅ Step 9: Create Test Data

### Via Django Admin:

1. **Create Fee Structure:**
   - Go to Financial → Fee Structures → Add
   - Name: "Grade 7 Tuition - Term 1"
   - Fee Type: Tuition
   - Amount: 50000
   - Academic Year: Select from dropdown
   - Term: Select term
   - Grade Level: Grade 7
   - Is Mandatory: ✓ (checked)
   - Save

2. **Check Auto-Assignment:**
   - Go to Financial → Student Fee Assignments
   - You should see all Grade 7 students with this fee assigned automatically!

3. **Record a Payment:**
   - Go to Financial → Receipts → Add
   - Student: Select student
   - Amount: 30000
   - Payer: "John's Father"
   - Paid Through: Cash
   - Save

4. **Allocate Payment:**
   - Open the receipt you just created
   - Scroll to "Fee Payment Allocations" inline
   - Click "Add another Fee Payment Allocation"
   - Fee Assignment: Select the student's tuition
   - Amount: 30000
   - Save

5. **Check Student Balance:**
   - Go to Financial → Student Fee Assignments
   - Find the student's tuition fee
   - You should see:
     - Amount Owed: ₦50,000
     - Amount Paid: ₦30,000
     - Balance: ₦20,000
     - Status: Partial

---

## ✅ Step 10: Frontend Integration

Your frontend is already set up! Just verify these files:

### Check Types (Already Correct ✓)

File: `types/index.ts`

```typescript
export interface FeeStructure {
  id?: number
  name: string
  amount: number
  grade_level: number | null
  // ... etc (already defined)
}

export interface FeePayment {
  id?: number
  student: number
  // ... etc (already defined)
}

export interface StudentFeeBalance {
  student: number
  total_fees: number
  // ... etc (already defined)
}
```

### Check Composables (Already Correct ✓)

File: `composables/admin/useFees.ts` - Already using correct endpoints

File: `composables/admin/usePayments.ts` - Already using correct endpoints

### Update Fee Structures Page (Already Built ✓)

File: `app/pages/admin/fees/index.vue` - Already complete!

---

## Troubleshooting

### Issue: "No module named 'financial.signals'"

**Fix:** Make sure `signals.py` exists and `apps.py` has the `ready()` method.

### Issue: "Table 'financial_feestructure' doesn't exist"

**Fix:** Run migrations:
```bash
python manage.py migrate financial
```

### Issue: Signals not working (fees not auto-assigning)

**Fix:** Make sure `apps.py` imports signals in the `ready()` method.

### Issue: Foreign key errors

**Fix:** Make sure you have:
- Academic app with `Student` model
- Administration app with `Term`, `AcademicYear`, `GradeLevel`, `ClassLevel` models
- Users app with `Accountant` model

---

## Verification Checklist

- [ ] Migrations created and applied
- [ ] Django admin shows all financial models
- [ ] Payment categories created
- [ ] Can create fee structure via admin
- [ ] Mandatory fees auto-assign to students
- [ ] Can record receipts
- [ ] Can allocate payments to fees
- [ ] Student balances calculate correctly
- [ ] API endpoints return data
- [ ] Frontend fee structures page loads
- [ ] Can create/edit fees from frontend

---

## Quick Test Script

Create this file: `test_financial.py`

```python
from django.test import TestCase
from financial.models import FeeStructure, StudentFeeAssignment, Receipt, FeePaymentAllocation
from academic.models import Student
from administration.models import Term, AcademicYear, GradeLevel

class FinancialTests(TestCase):
    def setUp(self):
        # Create test data
        self.year = AcademicYear.objects.create(
            name="2025",
            start_date="2025-01-01",
            active_year=True
        )
        self.term = Term.objects.create(
            name="Term 1",
            academic_year=self.year,
            start_date="2025-01-01",
            end_date="2025-04-30"
        )
        self.grade = GradeLevel.objects.create(name="Grade 7")
        self.student = Student.objects.create(
            admission_number="2025001",
            first_name="John",
            last_name="Doe",
            date_of_birth="2010-01-01",
            grade_level=self.grade,
            admission_date="2025-01-01",
            status="Active"
        )

    def test_mandatory_fee_auto_assignment(self):
        # Create mandatory fee
        fee = FeeStructure.objects.create(
            name="Tuition",
            fee_type="Tuition",
            amount=50000,
            academic_year=self.year,
            term=self.term,
            grade_level=self.grade,
            is_mandatory=True
        )

        # Check auto-assignment
        assignment = StudentFeeAssignment.objects.get(
            student=self.student,
            fee_structure=fee
        )
        self.assertEqual(assignment.amount_owed, 50000)
        self.assertEqual(assignment.balance, 50000)

    def test_partial_payment(self):
        # Create fee and assignment
        fee = FeeStructure.objects.create(
            name="Tuition",
            fee_type="Tuition",
            amount=50000,
            academic_year=self.year,
            is_mandatory=False
        )
        assignment = StudentFeeAssignment.objects.create(
            student=self.student,
            fee_structure=fee,
            term=self.term,
            amount_owed=50000
        )

        # Record payment
        receipt = Receipt.objects.create(
            student=self.student,
            amount=20000,
            payer="Father"
        )

        # Allocate payment
        allocation = FeePaymentAllocation.objects.create(
            receipt=receipt,
            fee_assignment=assignment,
            amount=20000
        )

        # Check balance
        assignment.refresh_from_db()
        self.assertEqual(assignment.amount_paid, 20000)
        self.assertEqual(assignment.balance, 30000)
        self.assertEqual(assignment.payment_status, "Partial")

print("Run with: python manage.py test financial.test_financial")
```

Run tests:
```bash
python manage.py test financial.test_financial
```

---

## Success! 🎉

Your financial system is now ready to use. You can:

✅ Define fee structures (mandatory/optional)
✅ Auto-assign mandatory fees to students
✅ Manually assign optional fees
✅ Record payments with partial payment support
✅ Allocate payments to specific fees
✅ Track student balances
✅ Waive fees (scholarships)
✅ Adjust fee amounts
✅ Manage outgoing payments
✅ Generate financial reports

**Next:** Start creating fee structures for your school! 🏫
