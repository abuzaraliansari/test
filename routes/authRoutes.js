const express = require('express');
const { login } = require('../controllers/loginController');
const { addProperty } = require('../controllers/PropertyController');
const { addOwner } = require('../controllers/OwnerController');
const { addfamilyMember } = require('../controllers/FamilyController');
const { addPropertyDetails } = require('../controllers/PropertyDetailsController');
const { addPropertyDetails1 } = require('../controllers/PropertyDetailsAreaController');
const PropertyDetailsHouseController = require('../controllers/PropertyDetailsHouseController'); // Imported correctly
const { addSpecialConsideration } = require('../controllers/SpecialConsiderationController');
const { GetLocality } = require('../controllers/localityController');
//const { GetColony } = require('../controllers/zoneController');
const { GetColony, AddColony } = require('../controllers/ColonyController');
// const { uploadFile, upload } = require('../controllers/fileUploadController');
// const { uploadDoc, Upload } = require('../controllers/DocumentUploadController');

const {addOwnerProperty} = require('../controllers/test'); // Added test controller

const { uploadFileMetadata, uploadTenantDocuments, upload } = require('../controllers/FileUpload'); // Added FileUpload controller


const { getMaxHouseNumber } = require('../controllers/HouseController'); // Added HouseController

const { GetOwnerDetails } = require('../controllers/dataController');
const { UpdateIsActive } = require('../controllers/submitteController');

const { updateFamilyMember } = require('../controllers/updateFamilyController');
const { updateOwner } = require('../controllers/updateOwnerController');
const { updatePropertyDetails } = require('../controllers/updatePropertyDetailsAreaController');
const  updatePropertyDetailsHouse  = require('../controllers/updatePropertyDetailsHouseController');
const { updateSpecialConsideration } = require('../controllers/updateSpecialConsiderationController');

const authenticateToken = require('../middlewares/authMiddleware');


const router = express.Router();

router.post('/login', login);
router.post('/property', authenticateToken,addProperty);
router.post('/owner', authenticateToken,addOwner);
router.post('/family',authenticateToken, addfamilyMember);
router.post('/PropertyDetails',authenticateToken,addPropertyDetails);
router.post('/PropertyDetails1', authenticateToken,addPropertyDetails1);
router.post('/PropertyDetailsHouse', authenticateToken,PropertyDetailsHouseController.update);
router.post('/SpecialConsideration', authenticateToken,addSpecialConsideration);
router.post('/Locality', authenticateToken,GetLocality);
router.post('/Colony', authenticateToken,GetColony);
router.post('/AddColony', authenticateToken,AddColony);
//router.post('/upload', upload.array('file'), uploadFile);
//router.post('/uploadDoc',Upload.array('file'), uploadDoc);
//router.post('/upload', upload.array('file'), uploadFile);
//router.post('/uploadDoc', upload.array('file'), uploadDoc);

router.post('/addOwnerProperty', addOwnerProperty);

router.post('/uploadFileMetadata', upload.array('files'), uploadFileMetadata);
router.post('/uploadTenantDocuments', upload.array('files'), uploadTenantDocuments);

router.post('/getMaxHouseNumber', authenticateToken,getMaxHouseNumber); 


router.post('/data', GetOwnerDetails);
router.post('/update', UpdateIsActive);

router.post('/updateFamily', updateFamilyMember);
router.post('/updateOwner', updateOwner);
router.post('/updatePropertyDetails', updatePropertyDetails);
router.post('/updatePropertyDetailsHouse', updatePropertyDetailsHouse);
router.post('/updateSpecialConsideration', updateSpecialConsideration);






module.exports = router;
