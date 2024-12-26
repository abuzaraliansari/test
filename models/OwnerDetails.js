class OwnerDetails {
    constructor(firstName, middleName, lastName, mobileNumber, occupation, age, gender, income, religion, category, createdBy, Email, PanNumber, AdharNumber, NumberOfMembers, Cast, IsActive) {
        this.firstName = firstName;
        this.middleName = middleName;
        this.lastName = lastName;
        this.mobileNumber = mobileNumber;
        this.occupation = occupation;
        this.age = age;
        this.gender = gender;
        this.income = income;
        this.religion = religion;
        this.category = category;
        this.createdBy = createdBy;
        this.Email = Email;
        this.PanNumber = PanNumber;
        this.AdharNumber = AdharNumber;
        this.NumberOfMembers = NumberOfMembers;
        this.Cast = Cast;
        this.IsActive = IsActive;
    }

    validate() {
        if (!this.firstName || !this.lastName || !this.mobileNumber || !this.createdBy) {
            throw new Error("First Name, Last Name, Mobile Number, and Created By are required fields.");
        }

        if (!['M', 'F', 'O'].includes(this.gender)) {
            throw new Error("Gender must be 'M', 'F', or 'O'.");
        }

        if (this.age <= 18) {
            throw new Error("Age must be greater than 18.");
        }

        if (isNaN(this.income) || this.income < 0) {
            throw new Error("Income must be a positive number.");
        }
    }
}

module.exports = OwnerDetails;
