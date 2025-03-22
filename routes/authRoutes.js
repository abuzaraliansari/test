const express = require('express');
const { login } = require('../controllers/loginController');
const { addProperty } = require('../controllers/PropertyController');
const { addOwner } = require('../controllers/OwnerController');
const { checkMobileNumber, checkMobile } = require('../controllers/checkMobileNumber');
const { addfamilyMember } = require('../controllers/FamilyController');
const { addPropertyDetails } = require('../controllers/PropertyDetailsController');
const { addPropertyDetails1 } = require('../controllers/PropertyDetailsAreaController');
const PropertyDetailsHouseController = require('../controllers/PropertyDetailsHouseController'); // Imported correctly
const { addSpecialConsideration } = require('../controllers/SpecialConsiderationController');
const { GetLocality } = require('../controllers/localityController');
const { GetColony, AddColony } = require('../controllers/ColonyController');
const { addOwnerProperty } = require('../controllers/test'); // Added test controller
const { uploadFileMetadata, uploadTenantDocuments } = require('../controllers/FileUpload'); // Added FileUpload controller
const { getMaxHouseNumber } = require('../controllers/HouseController'); // Added HouseController
const { GetOwnerDetails } = require('../controllers/dataController');
const { UpdateIsActive } = require('../controllers/submitteController');
const { updateFamilyMember } = require('../controllers/updateFamilyController');
const { updateOwner } = require('../controllers/updateOwnerController');
const { updatePropertyDetails } = require('../controllers/updatePropertyDetailsAreaController');
const updatePropertyDetailsHouse = require('../controllers/updatePropertyDetailsHouseController');
const { updateSpecialConsideration } = require('../controllers/updateSpecialConsiderationController');
const authenticateToken = require('../middlewares/authMiddleware');
const { loginC, signup, updateUserStatus, getAllUsersWithRoles } = require('../controllers/authController');
const { submitComplaint, updateComplaintStatus, updateComplaintStatusOpen } = require('../controllers/complaintController');
const { submitFiles } = require('../controllers/submitFiles');
const { getComplaints, getUsers, getComplaintsByDateRange } = require('../controllers/ComplainStatus');
const { getComplaintReplies, submitComplaintReply } = require('../controllers/complaintReplyController');

const router = express.Router();

// Configure multer for file uploads
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });

router.post('/login', login);
router.post('/property', authenticateToken, addProperty);
router.post('/owner', authenticateToken, addOwner);
router.post('/checkMobile', checkMobile);
router.post('/check', checkMobileNumber);
router.post('/family', authenticateToken, addfamilyMember);
router.post('/PropertyDetails', authenticateToken, addPropertyDetails);
router.post('/PropertyDetails1', authenticateToken, addPropertyDetails1);
router.post('/PropertyDetailsHouse', authenticateToken, PropertyDetailsHouseController.update);
router.post('/SpecialConsideration', authenticateToken, addSpecialConsideration);
router.post('/Locality', GetLocality);
router.post('/Colony', GetColony);
router.post('/AddColony', AddColony);
router.post('/addOwnerProperty', addOwnerProperty);
router.post('/uploadFileMetadata', upload.array('files'), uploadFileMetadata);
router.post('/uploadTenantDocuments', upload.array('files'), uploadTenantDocuments);
router.post('/getMaxHouseNumber', authenticateToken, getMaxHouseNumber);
router.post('/data', GetOwnerDetails);
router.post('/update', UpdateIsActive);
router.post('/updateFamily', updateFamilyMember);
router.post('/updateOwner', updateOwner);
router.post('/updatePropertyDetails', updatePropertyDetails);
router.post('/updatePropertyDetailsHouse', updatePropertyDetailsHouse);
router.post('/updateSpecial', updateSpecialConsideration);
router.post('/loginC', loginC);
router.post('/signup', signup);
router.post('/updateUserStatus', updateUserStatus);
router.post('/getAllUsersWithRoles', getAllUsersWithRoles);
router.post('/complaints', submitComplaint);
router.post('/submitFiles', upload.fields([{ name: 'attachmentDoc', maxCount: 1 }, { name: 'userImage', maxCount: 1 }]), submitFiles);
router.post('/complaintsstatus', updateComplaintStatus);
router.post('/complaintsstatusopen', updateComplaintStatusOpen);
router.post('/complain', getComplaints);
router.post('/getUsers', getUsers);
router.post('/complaintsreplies', getComplaintReplies);
router.post('/complaintsreply', submitComplaintReply);
router.post('/getComplaintsByDateRange', getComplaintsByDateRange);

module.exports = router;