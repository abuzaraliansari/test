class FamilyMember {
    constructor(Relation, FirstName, LastName, age, gender, occupation, createdBy) {
        this.ownerId = ownerId;
        this.Relation = Relation;
        this.FirstName = LastName;
        this.LastName = LastName;
        this.age = age;
        this.gender = gender;
        this.occupation = occupation;
        this.createdBy = createdBy;
        this.IsActive = IsActive;
    }

    validate() {
        if (!this.name || !this.createdBy) {
            throw new Error("Name and Created By are required fields.");
        }

        if (!['M', 'F', 'O'].includes(this.gender)) {
            throw new Error("Gender must be 'M', 'F', or 'O'.");
        }

        if (!['1', '2', '3'].includes(this.Locality)) {
            throw new Error("Locality must be '1', '2', or '3'.");
        }
    }
}

module.exports = FamilyMember;
