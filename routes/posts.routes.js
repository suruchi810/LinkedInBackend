import {Router} from "express"
import { activeCheck, createPost, getAllPosts, deletePost, incLikes, commentPost, get_comments_by_posts, commentDelete } from "../controllers/posts.controllers.js";
import multer from "multer"

const router = Router();

const storage = multer.diskStorage({
    destination: (req, res, cb) =>{
       cb(null, 'profile_pictures/') 
    },
    filename: (req, file, cb) =>{
        cb(null, file.originalname);
    }
})
const upload = multer({storage: storage});

router.route('/').get(activeCheck);
router.route('/post').post(upload.single('media'), createPost);
router.route('/posts').get(getAllPosts);
router.route('/deletePosts').delete(deletePost);
router.route('/incLikes').post(incLikes);
router.route('/comments').post(commentPost);
router.route('/get_comments_by_posts').get(get_comments_by_posts);
router.route('/commentDelete').get(commentDelete);
export default router;