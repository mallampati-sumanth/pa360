import random
import uuid
from datetime import datetime, timedelta

def esc(val):
    if val is None:
        return 'NULL'
    if isinstance(val, bool):
        return 'TRUE' if val else 'FALSE'
    if isinstance(val, (int, float)):
        return str(val)
    # simple escape for string
    val = str(val).replace("'", "''")
    return f"'{val}'"

def main():
    random.seed(42)
    
    # 1. PAYERS
    payers = [
        ('PAY001', 'BlueShield'),
        ('PAY002', 'Aetna'),
        ('PAY003', 'UnitedHealth'),
        ('PAY004', 'Cigna')
    ]
    
    print("-- Payers")
    for p in payers:
        print(f"INSERT INTO PA360_DEV.CURATED.PAYERS (PAYER_ID, PAYER_NAME) VALUES ({esc(p[0])}, {esc(p[1])});")

    # 2. PLANS
    plans = []
    variants = ['Gold', 'Silver', 'Bronze']
    for p in payers:
        for v in variants:
            plan_id = f"PLN_{p[0]}_{v}"
            plans.append((plan_id, f"{p[1]} {v} Plan", p[0]))
    
    print("\n-- Plans")
    for pl in plans:
        print(f"INSERT INTO PA360_DEV.CURATED.PLANS (PLAN_ID, PLAN_NAME, PAYER_ID) VALUES ({esc(pl[0])}, {esc(pl[1])}, {esc(pl[2])});")

    # 3. PROVIDERS
    providers = []
    specialties = ['Cardiology', 'Oncology', 'Orthopedics', 'Neurology', 'Primary Care']
    print("\n-- Providers")
    for i in range(1, 31):
        prov_id = f"PRV{i:03d}"
        providers.append(prov_id)
        spec = random.choice(specialties)
        npi = f"1000000{i:03d}"
        print(f"INSERT INTO PA360_DEV.CURATED.PROVIDERS (PROVIDER_ID, PROVIDER_NAME, SPECIALTY, NPI_NUMBER) VALUES ({esc(prov_id)}, {esc('Dr. Smith ' + str(i))}, {esc(spec)}, {esc(npi)});")

    # 4. SERVICES
    services = []
    svc_names = ['MRI Brain', 'Cardiac Catheterization', 'Hip Replacement', 'Chemotherapy', 'Physical Therapy', 'Routine Checkup']
    print("\n-- Services")
    for i in range(1, 26):
        svc_code = f"SVC{i:03d}"
        services.append(svc_code)
        auth_req = random.choice([True, False])
        print(f"INSERT INTO PA360_DEV.CURATED.SERVICES (SERVICE_CODE, SERVICE_NAME, AUTHORIZATION_REQUIRED) VALUES ({esc(svc_code)}, {esc(random.choice(svc_names) + ' ' + str(i))}, {esc(auth_req)});")

    # 5. PATIENTS
    patients = []
    print("\n-- Patients")
    for i in range(1, 501):
        pat_id = f"PAT{i:04d}"
        patients.append(pat_id)
        plan = random.choice(plans)[0]
        dob = (datetime.now() - timedelta(days=random.randint(1000, 30000))).strftime('%Y-%m-%d')
        print(f"INSERT INTO PA360_DEV.CURATED.PATIENTS (PATIENT_ID, NAME, DATE_OF_BIRTH, GENDER, PLAN_ID, INSURANCE_ID) VALUES ({esc(pat_id)}, {esc('Patient ' + str(i))}, {esc(dob)}, {esc(random.choice(['M', 'F']))}, {esc(plan)}, {esc('INS'+str(i))});")

    # 6. AUTHORIZATION REQUESTS
    print("\n-- Authorization Requests")
    statuses = {
        'Draft': 200, 'Ready for Submission': 150, 'Submitted': 200, 'Pending': 150,
        'Additional Info Requested': 100, 'Approved': 250, 'Denied': 150, 'Expired': 100,
        'Existing (Reused)': 75, 'Exception – Review Required': 125
    }
    
    edge_cases = {
        'EMERGENCY_RETRO': 25,
        'NEWBORN_NEW_ENROLLEE': 25,
        'APPROVED_NOT_COVERED': 25,
        'DENIAL_APPEAL': 25,
        'CLINICAL_CHANGE': 25,
        'COB': 25
    }
    
    all_reqs = []
    for stat, count in statuses.items():
        for _ in range(count):
            all_reqs.append({'status': stat, 'edge_case': 'NONE'})
            
    # Assign edge cases overriding the dummy ones
    idx = 0
    for ec, count in edge_cases.items():
        for _ in range(count):
            all_reqs[idx]['edge_case'] = ec
            idx += 1

    random.shuffle(all_reqs)
    
    auth_ids = []
    for req in all_reqs:
        auth_id = str(uuid.uuid4())
        auth_ids.append(auth_id)
        pat = random.choice(patients)
        prov = random.choice(providers)
        svc = random.choice(services)
        payer = random.choice(payers)[0]
        plan = random.choice(plans)[0]
        
        stat = req['status']
        edge = req['edge_case']
        
        is_retro = True if edge == 'EMERGENCY_RETRO' else False
        priority = 'EMERGENCY' if edge == 'EMERGENCY_RETRO' else 'ROUTINE'
        
        if edge == 'NEWBORN_NEW_ENROLLEE':
            pass # would update patient normally
        
        cov_verif = False if edge == 'APPROVED_NOT_COVERED' else True
        if edge == 'APPROVED_NOT_COVERED': stat = 'Approved'
        
        app_stat = 'APPEAL_FILED' if edge == 'DENIAL_APPEAL' else 'NOT_APPLICABLE'
        if edge == 'DENIAL_APPEAL': stat = 'Denied'
        
        clin_change = True if edge == 'CLINICAL_CHANGE' else False
        if edge == 'CLINICAL_CHANGE': stat = 'Approved'
        
        sec_payer = random.choice(payers)[0] if edge == 'COB' else None
        
        print(f"INSERT INTO PA360_DEV.CURATED.AUTHORIZATION_REQUESTS (AUTHORIZATION_ID, PATIENT_ID, PROVIDER_ID, PAYER_ID, PLAN_ID, SERVICE_CODE, STATUS, EDGE_CASE_TYPE, IS_RETRO_AUTH, PRIORITY, COVERAGE_VERIFIED, APPEAL_STATUS, CLINICAL_CHANGE_DETECTED, SECONDARY_PAYER_ID) VALUES ({esc(auth_id)}, {esc(pat)}, {esc(prov)}, {esc(payer)}, {esc(plan)}, {esc(svc)}, {esc(stat)}, {esc(edge)}, {esc(is_retro)}, {esc(priority)}, {esc(cov_verif)}, {esc(app_stat)}, {esc(clin_change)}, {esc(sec_payer)});")

    # 7. PAYER RESPONSES
    print("\n-- Payer Responses")
    for auth_id in auth_ids:
        resp_id = str(uuid.uuid4())
        payer = random.choice(payers)[0]
        print(f"INSERT INTO PA360_DEV.CURATED.PAYER_RESPONSES (RESPONSE_ID, AUTHORIZATION_ID, PAYER_ID, RESPONSE_TYPE) VALUES ({esc(resp_id)}, {esc(auth_id)}, {esc(payer)}, 'Acknowledgment');")
        
    # 8. SAMPLE DOCUMENTS
    print("\n-- Sample Documents")
    for i in range(100):
        doc_id = str(uuid.uuid4())
        auth = random.choice(auth_ids)
        print(f"INSERT INTO PA360_DEV.CURATED.SAMPLE_DOCUMENTS (DOCUMENT_ID, AUTHORIZATION_ID, DOCUMENT_TYPE, FILE_NAME) VALUES ({esc(doc_id)}, {esc(auth)}, 'CLINICAL_NOTES', 'clinical_note.pdf');")

if __name__ == '__main__':
    main()
