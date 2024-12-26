class PropertyDetails1 {
    constructor( Locality ,galliNumber, createdBy, Zone , Colony) {
        this.ownerId = ownerId;
        this.Locality = Locality;
        this.galliNumber = galliNumber;
        this.createdBy = createdBy;
        this.Zone = Zone;
        this.Colony = Colony;
    }

    validate() {
        if (!this.ownerId || !this.Locality || !this.galliNumber || !this.createdBy || !this.Zone) {
            throw new Error("OwnerID, Locality, GalliNumber, CreatedBy, and Zone are required fields.");
        }
    }
}

module.exports = PropertyDetails1;
