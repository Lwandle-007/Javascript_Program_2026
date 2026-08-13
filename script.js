class Student {
    constructor(name, age, marks) {
        this.name = name;
        this.age = age;
        this.marks = marks;
    }

    calculateAverage() {
      const total = this.marks.reduce((sum, mark) => sum + mark, 0);
      return total / this.marks.length;
    }

    getResults(){
       const average = this.calculateAverage();
       if(average >= 50){
            return "pass";
       }else{
            return "fail";
       }
    }
}

class Course {
    constructor(courseName) {
        this.courseName = courseName;
        this.students = [];
    }

    addStudent(student) {
        this.students.push(student);
    }

    getPassed() {
        return this.students.filter(student =>{
        return student.calculateAverage() >= 50;
        });
    }
}
     calculateTotalMarks() {
        return this.students.reduce((total, student) => {
            return total + student.marks.reduce((sum, mark) => {
                return sum + mark;
            }, 0);
        }, 0);
     }

     const student1 = new Student("lwandle", 20, [80, 90, 70]);
     const student2 = new Student("onkarabetswe", 22, [45, 50, 60]);
    const student3 = new Student("hilda", 21, [75, 80, 90]);

    const course = new Course("JavaSript Fundamentals");

    course.addStudent(student1);
    course.addStudent(student2);
    course.addStudent(student3);

    console.log(student1.getResults()); // Output: pass
    console.log(student2.getResults()); // Output: fail
    console.log(student3.getResults()); // Output: pass

    console.log(student1.calculateAverage()); // Output: 80
    console.log(student2.calculateAverage()); // Output: 51.666666666666664
    console.log(student3.calculateAverage()); // Output: 81.66666666666667

    console.log(course.getPassed()); // Output: [student1, student3]
    console.log(course.calculateTotalMarks()); // Output: 550