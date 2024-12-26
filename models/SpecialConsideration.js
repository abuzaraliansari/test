class SpecialConsideration {
    constructor(ownerID, propertyID, considerationType, description, createdBy, geoLocation,IsActive) {
        this.ownerID = ownerID;
        this.propertyID = propertyID;
        this.considerationType = considerationType;
        this.description = description;
        this.createdBy = createdBy;
        this.geoLocation = geoLocation;
       // this.IsActive = IsActive;
    }

    // Validate the fields
    validate() {
        if (!this.ownerID) {
            throw new Error("OwnerID is required.");
        }

        if (!this.considerationType || !['Senior Citizen', 'Freedom Fighter', 'Armed Forces', 'Handicapped', 'Widow', 'None'].includes(this.considerationType)) {
            throw new Error("Invalid ConsiderationType. Must be one of: 'Senior Citizen', 'Freedom Fighter', 'Armed Forces', 'Handicapped', 'Widow', 'None'.");
        }

        if (!this.createdBy) {
            throw new Error("CreatedBy is required.");
        }

        if (this.description && this.description.length > 255) {
            throw new Error("Description must not exceed 255 characters.");
        }
    }
}

module.exports = SpecialConsideration;
