class PropertyDetails {
    constructor(propertyMode, propertyAge, roomCount, floorCount, shopCount, tenantCount, waterHarvesting, submersible, geoLocation, IsActive, houseNumber, galliNumber, bankAccountNumber, consent, createdBy, Zone) {
        this.ownerId = ownerId;
        this.propertyMode = propertyMode;
        this.propertyAge = propertyAge;
        this.roomCount = roomCount;
        this.floorCount = floorCount;
        this.shopCount = shopCount;
        this.tenantCount = tenantCount;
        this.waterHarvesting = waterHarvesting;
        this.submersible = submersible;
        this.geoLocation = geoLocation;
        this.Locality = Locality;
        this.houseNumber = houseNumber;
        this.galliNumber = galliNumber;
        this.bankAccountNumber = bankAccountNumber;
        this.consent = consent;
        this.createdBy = createdBy;
        this.Zone = Zone;
        this.IsActive = IsActive;
    }

    validate() {
        if (!this.propertyMode || !['Residential', 'Commercial'].includes(this.propertyMode)) {
            throw new Error("Property Mode must be 'Residential' or 'Commercial'.");
        }

        if (this.roomCount < 0 || this.floorCount < 0 || this.shopCount < 0 || this.tenantCount < 0) {
            throw new Error("Room Count, Floor Count, Shop Count, and Tenant Count cannot be negative.");
        }

        if (typeof this.waterHarvesting !== 'boolean' || typeof this.submersible !== 'boolean') {
            throw new Error("WaterHarvesting and Submersible must be boolean values.");
        }

        if (!this.bankAccountNumber || !/^\d{16}$/.test(this.bankAccountNumber)) {
            throw new Error("Bank Account Number must be a valid 16-digit number.");
        }

        if (typeof this.consent !== 'boolean') {
            throw new Error("Consent must be a boolean.");
        }
    }
}

module.exports = PropertyDetails;
