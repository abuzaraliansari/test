const OwnerDetails = require('./OwnerDetails');
const FamilyMember = require('./FamilyMember');
const PropertyDetails = require('./PropertyDetails');

class PropertyRequest {
    constructor(ownerDetails, familyMembers, propertyDetails) {
        this.ownerDetails = new OwnerDetails(ownerDetails.firstName, ownerDetails.middleName, ownerDetails.lastName, ownerDetails.mobileNumber, ownerDetails.occupation, ownerDetails.age, ownerDetails.gender, ownerDetails.income, ownerDetails.religion, ownerDetails.category, ownerDetails.createdBy);
        this.familyMembers = familyMembers.map(member => new FamilyMember(member.name, member.age, member.gender, member.occupation, member.createdBy));
        this.propertyDetails = new PropertyDetails(propertyDetails.propertyMode, propertyDetails.propertyAge, propertyDetails.roomCount, propertyDetails.floorCount, propertyDetails.shopCount, propertyDetails.tenantCount, propertyDetails.waterHarvesting, propertyDetails.submersible, propertyDetails.geoLocation, propertyDetails.moholla, propertyDetails.houseNumber, propertyDetails.galliNumber, propertyDetails.bankAccountNumber, propertyDetails.consent, propertyDetails.createdBy);
    }

    validate() {
        try {
            this.ownerDetails.validate();
            this.familyMembers.forEach(member => member.validate());
            this.propertyDetails.validate();
        } catch (error) {
            throw new Error(error.message);
        }
    }
}

module.exports = PropertyRequest;
