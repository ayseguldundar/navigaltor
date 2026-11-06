import assert from 'node:assert/strict';
import { createMock } from './mock-supabase.mjs';

const { db, rpc } = createMock();
const schoolA = 'school-a';
const schoolB = 'school-b';
const admin = { id: 'admin-a', school_id: schoolA, role: 'admin' };
const teacher = { id: 'teacher-a', school_id: schoolA, role: 'teacher' };
const sectionA = { id: 'section-a', school_id: schoolA };
const sectionB = { id: 'section-b', school_id: schoolA };
const sectionOther = { id: 'section-other', school_id: schoolB };
const student = { id: 'student-a', school_id: schoolA, section_id: sectionA.id, first_name: 'Ada', last_name: 'Örnek', student_no: '1', active: true };

db.profiles.push(admin, teacher);
db.sections.push(sectionA, sectionB, sectionOther);
db.students.push(student);

assert.throws(() => rpc.reset_section_pins(teacher, { p_section: sectionA.id }), /Yalnızca okul yöneticisi/);
assert.equal(Object.hasOwn(db.secrets, student.id), false, 'öğretmen reddedilince PIN değişmemeli');
assert.throws(() => rpc.move_student(teacher, { p_student: student.id, p_section: sectionB.id }), /okul yöneticisi/);
assert.throws(() => rpc.move_student(admin, { p_student: student.id, p_section: sectionOther.id }), /aynı okulda/);
assert.equal(student.section_id, sectionA.id, 'reddedilen işlemler öğrenci kaydını değiştirmemeli');

const pins = rpc.reset_section_pins(admin, { p_section: sectionA.id });
assert.equal(pins.length, 1, 'aynı okulun admini PIN yenileyebilmeli');
assert.equal(rpc.move_student(admin, { p_student: student.id, p_section: sectionB.id }), null);
assert.equal(student.section_id, sectionB.id);

console.log('Mock security authorization tests passed (not a database/RLS test).');
