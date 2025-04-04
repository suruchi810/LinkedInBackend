import {Router} from "express"
import {register, login, uploadprofilepicture, updateUserProfile, getUserProfile, updateProfileData, getAllUserProfile, downloadProfile, getUserProfileAndUserBasedOnUsername,sendConnectionRequest , getMyConnectionRequest,whatAreMyConnections , acceptConnectionRequest} from "../controllers/user.controller.js";
import multer from 'multer';

const router = Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'profile_pictures/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
})

const upload = multer({ storage: storage });
router.route('/upload_profile_picture').post(upload.single("profile_picture"), uploadprofilepicture);
router.route('/register').post(register);
router.route('/login').post(login);
router.route('/user_update').post(updateUserProfile);
router.route('/get_usr_and_profile').get(getUserProfile);
router.route('/updateProfileData').post(updateProfileData);
router.route('/user/getAllUsersProfile').get(getAllUserProfile);
router.route('/user/download_resume').get(downloadProfile);
router.route('/user/sendConnectionRequest').post(sendConnectionRequest);
router.route('/user/getConnectionRequest').get(getMyConnectionRequest);
router.route('/user/user_connection_request').get(whatAreMyConnections);
router.route('/user/accep_connection_request').post(acceptConnectionRequest);
router.route('/user/get_profile_based_on_username').get(getUserProfileAndUserBasedOnUsername);


export default router;
