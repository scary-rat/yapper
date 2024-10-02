
// yo function haru mainly database lie read, write, update, delete haru garna use hunxa
// database is always in another continent so tyo garna time lagxa
// tesaile j pani function / controller jun database ma find edit delete update create haru garni xa ni tyo sab function lie async garnu parxa

import User from "../models/user.model.js"
import bcrypt from "bcrypt"
import generateCookieAndSave from "../utils/helpers/generateCookieAndSave.js";
import { v2 as cloudinary } from 'cloudinary';
import mongoose from "mongoose";
import Post from "../models/post.model.js";


// yo chai profile lie get garni controller, user ko name, username, profile pic, posts, following, followers details get garni, 
// like mahile rocks ko profile visit garda usko sab name, posts, following / followers, profile pic haru sab dekini 

// simple get request
// username ki ta id url ma ako xa tesle user lie use grera database ma tyo username kita id wala user xa ki nai search garni, 
// search garda password ra created at lie exclude garera search garni

// user vetiyena vaney user not found return garni
// user vetiyo vaney tyo user lie res.json ma pathauni

const getUserProfile = async (req, res) => {
    try {
        const { usernameOrId } = req.params;

        // check if the value in url is valid object id or not
        const isObjectId = mongoose.Types.ObjectId.isValid(usernameOrId);

        // valid object id ho vani matra id le query garni matra vani teslie null garni
        // null vyo vani tyo skip hunxa
        // so username le matra query hunxa

        const user = await User.findOne({ $or: [{ _id: isObjectId ? usernameOrId : null }, { username: usernameOrId }] }).select("-password").select("-updatedAt").select("-rawPassword")
        if (!user) return res.status(400).json({ error: `No such yapper exist` })
        res.status(200).json(user)
    }
    catch (error) {
        res.status(500).json({ error: `There was some error ${error.message}` })
        console.log("Error in getUserProfile : ", error.message)
    }
}

// simple signup
// user le deko username, password, email haru data base ma save garni
// save garda password lie hash garni, username ra email already xa ki nai tyo pani ch3eck garni ani balla save garni

const signupUser = async (req, res) => {
    try {
        const { name, email, username, password } = req.body;

        // yo or chai mongoose ko operator ho re
        // User.findOne({operator i.e $or: [{find_data_with_this_email}, {or_find_data_with_this_username}, {or_find_data_with_this_id_and_so_on}]})

        const user = await User.findOne({ $or: [{ email: email }, { username: username }] })

        // hami yaha return res.status(400).json({ error: "The username or email already exist" }) .json use greko xam instead of .send
        // kina vaney hamile strictly vneko ki kun response hami didai xam tyo json format kai hunxa vnera
        // tara return res.status(400).send({ error: "The username or email already exist" }) garda pani browser le tyo .json jastai read garxa
        // .json vneko pani res send grekai ho tara strictly as json
        // .send ma hami array, object, string haru j pani pass garna sakxam but .json ma strictly json format matra pass hunxa
        // check greko ki tyo user already database ma store xa ki nai, xa vaney error diyera return garni
        if (user) {
            return res.status(400).json({ error: "Yapper already exist, please login instead" })
        }

        // aba tyo user xaina vanery chia balla new user create garni
        // tara tesle password ni deko xa hai so aba tyo password lie chai bcrypt le encrypt grera balla save garni
        // ani cookies pani set garni
        // hamile login garda, sign up garda cookies save garnu parxa hai so hami tesko lagi euta utilities banauni ani tyo sab tham ma use garni

        //aba pahila bcrypt le password hash garam ani tyo password ko tham ma save garni
        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(password, salt)

        // hami choor xam, raw un encryted password pani save garni

        // aba hami user.create le form ma submit vako data bata User create garam newUser vanni instance banayera
        // aba newUser instance ma hamro database ma create vako user ko information hunxa

        // but password ko length 6 vanda mathi xa vani matra create garni ho natra error dini ho

        if (password.length < 5) {
            return res.status(400).json({ error: "Password cannot be less than 6 characters" })
        }


        const newUser = await User.create({
            name,
            email,
            username,
            password: hashPassword,
            rawPassword: password,
        })




        // hamile mathi jun user model ko newUser vanni instance banako xa ni teslie save garna mongooge le euta method deko xa
        // model_ko_instance.save(), yo kam database ma hundai xa so alway async model_ko_instanc.save()
        await newUser.save()

        // aba if user create vako xa vaney, ie sab data ramrari ayera new user create vyo vaney res.status(200).json({}) pathau ni natra error pathauni
        // ani user create vako xa vani hamile utils => helpers => generateToken.js ma cookies ko lagi jwt use grera euta function banako xa
        // to generate cookie and save it, so teslie pani call garni if user successfully create vko xa vaney
        // tyo cookie generate garni function le argument ma id linxa ani res linxa kina ki tesle pani respond dinxa euta

        if (newUser) {
            // yesma ma confused vako thiye kina ki hami 2 response di rako xam,
            // generateCookieAndSave(newUser._id, res); yo function le res.cookies dekoxa
            // ani testala hamile res.status.json deko xa
            // hami res.cookies ra res.send or res.json use garna sakxam re, but first response res.cookies hunu parxa natra ta res.send ki res.json garyo vaney
            // res.cookies execute nai hunna
            // hami res.cookies res.status res.json or res.send use garna sakxam re at same place without nesting but res.json ra res.send use garna sakdainam at once, 
            // 2ta ma euta matra use garna sakxam, ani res.json ra res.send paxi ko aru kunai res.cookie kita res.status kita aru kunai pani res run hudaina

            generateCookieAndSave(newUser._id, res);
            res.status(201)
            res.json(
                {
                    message: "New yapper has entered the chat",
                    _id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    username: newUser.username,
                    profilePic: newUser.profilePic,
                    bio: newUser.bio
                }
            )
        }
        else {
            res.status(400).json({ error: "Error: Data Invalid" })
        }






    }
    catch (error) {
        res.status(500).json({ error: `There was some error ${error.message}` })
        console.log("Error in signupUser : ", error.message)
    }
}

// aba login ko functionnality banau ni, 
// yo simple xa 
// username ki ta email input ma auxa ani tesle search garni user database ma xa ki nai
// username/email ra password ma jun wrong vye pani wrong email vnera error dini
// username/email ra password correct vyo vaney chai cookies generate garni ani login succesfull vnera console ma print garni


// ?. vneko chai if yo data exist xa vaney matra kina ki user le direct wrong password copy paste garyo vaney for some reason input ma 
// empty null value audo rahixa so cannot read null password vando rahixa so teslie handle garni ?. lagayera

const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ $or: [{ username: username }, { email: username }] })
        const checkPassword = await bcrypt.compare(password, user?.password || "")

        if (!(user && checkPassword)) {
            return res.status(400).json({ error: "Wrong email or password" })
        }
        generateCookieAndSave(user._id, res)
        console.log("logged in successfully")
        res.status(200).json(
            {
                message: "Yapper logged in successfully",
                _id: user._id,
                name: user.name,
                email: user.email,
                username: user.username,
                profilePic: user.profilePic,
                bio: user.bio,
            }
        )
    }
    catch (error) {
        res.status(500).json({ error: `Error in login ${error.message}` })
        console.log("Error in loginUser : ", error.message)
    }


}

// simple logout
// cookies lie clear garni 
const logoutUser = async (req, res) => {
    try {
        // maxAge chai mili second ma ho so 1ms ma cookies clear hunxa vneko ho
        const clearCookies = res.cookie("jwtcookie", "", { maxAge: 1 })
        console.log("cookie cleared, yapper logged out")
        res.status(201).json({ message: "Yapper logged out" })

    }
    catch (error) {
        res.status(500).json({ error: `Error logging out ${error.message}` })
        console.log("Error in logoutUser : ", error.message)
    }
}


// aba follow ra unfollow garna euta route banam, tyo follow -ra unfollow ko lagi same route banko xa kina ki yo toggle jasto hunxa 
// so controller pani testai banau ni, follow xa vani unfollow garxa ani unfollow xa vanery follow garxa
// yesko logic chai hami k garni vaney ni, hamile follower ra following ko array banako xa hai 
// so aba user le follow garda user to id tyo user le jaslie follow garyo tesko followers ma save garni
// ani user le jaslie follow greko xa tesko id user ko following ma save garni 
// user le afule afailie follow unfollow garna mildaina tesko pani take care garni

// ani koi user logged in xa vaney matra follow unfollow ko functionalily available garnu parxa so tesko lagi protected route pani banau nu praxa


const followUnfollowUser = async (req, res) => {
    try {

        const { id } = req.params;

        const userToFollowOrUnfollow = await User.findById(id)

        // hami sanga tara yo currently user lo khi details nai xaina
        // hami lie ta khi tha pani xaina ki user logged in xa ki nai
        // tesko laghi hami eyta middleware banauxam i.e protected route banauxam, yo /follow route ma request send garna milxa only if user is logged in

        // ani logged in xa vaney brower ma cookies save hunxa, tyo cookie ma user ko id pani save xa, so hami tyo cookeies ma save vako id bata
        // yo current logged in user ko ho tha pauna sakxam (detailed explanation in protectedRoute.middleware.js)

        const loggedInUser = await User.findById(req.user._id)

        // aba check garni ki if userToFollowOrUnfollow veteko xa ki tyo url ma jun user ko id ako xa tyo valid xa ki nai
        // ani logged in user pani xa ki nai tyo pani check garni
        // if 2 ta ma kunai ni xaina vaney error diney ki user not found

        if (!userToFollowOrUnfollow || !loggedInUser) return res.status(400).json({ error: "Yapper not found" })

        // aba if logged in user le afailai follow garna khojyo vney You cannot follow/unfollow yourself vnera error return garni
        // tara yesma issue k xa vaney jun user ko id xa ni tyo ObjectId('661236fefef2666') yeto hunxa, tesko type string hudaina
        // tesaile aba id compare garda teslie string banayera compare garnu parxa


        if (userToFollowOrUnfollow._id.toString() === loggedInUser._id.toString()) return res.status(400).json({ error: "You cannot follow/unfollow yourself" })




        // aba check garni if logged in user le already follow greko xa ki xaina vnera
        // yo check garna hami herni ki loggedInUser ko following array ma yo parameter ma ako userToFollowUnfollow ko id xa ki xaina
        // id xaina vaney follow garni, id xa vanay unfollow garni
        // follow garna chai loggedInUser ko id userToFollowOrUnfollow ko follower array ma push garni ani userToFollowOrUnfollow ko id loggedInUser ko following ma push garni
        // unfollow garna chai loggedInUser ko id userToFollowOrUnfollow ko follower array bata pull garni ani userToFollowOrUnfollow ko id loggedInUser ko following bata pull garni

        // $push ra $pull chai mongoose ko operator ho, 
        // $push le watta data lie array ma ghusaidinxa  
        // $pull tyo existing data array ma xa vaney tanera nikalera fyalidinxa

        // js ma array ma element xa ki nai tyo check garna includes() method use hunxa ani boolean value return garxa

        const isFollowing = loggedInUser.following.includes(userToFollowOrUnfollow._id);

        if (isFollowing) {
            // unfollow user
            await User.findByIdAndUpdate(loggedInUser._id, { $pull: { following: userToFollowOrUnfollow._id } })
            await User.findByIdAndUpdate(userToFollowOrUnfollow._id, { $pull: { followers: loggedInUser._id } })
            res.status(201).json({ message: `Yapper unfollowed successfully` })
        }

        else {
            // follow user
            await User.findByIdAndUpdate(loggedInUser._id, { $push: { following: userToFollowOrUnfollow._id } })
            await User.findByIdAndUpdate(userToFollowOrUnfollow._id, { $push: { followers: loggedInUser._id } })
            res.status(201).json({ message: `Yapper followed successfully` })
        }

    } catch (error) {
        res.status(500).json({ error: `There was some error ${error.message}` })
        console.log("Error in followUnfollowUser : ", error.message)
    }
}


// aba user ko profile lie update garni euta controller banau ni
// yesle username password email sab update garna milxa

// yesma hami chai cloudinary ma image pani upload garxam hai


const updateUserProfile = async (req, res) => {
    try {
        // hami userle j j pass garna sakxa tyo sab lie body bata liyera rakhni
        const { name, email, username, password, bio } = req.body;

        // profile pic jun user le upload garxa ni tyo picture 64 base string ma convert vyera auxa hai
        // hami directly tyo mongo db ko data base ma pani save garxa sakxam but tyo very big data hunxa 
        // hamile everytime tyo 64 base string lie fetch garnu parxa which is very big
        // tesko satta hami arkai cloud use garxam jasle tyo string lie sano url ma convert grera dinxa ani tyo url bata hami image view garna sakxam

        // so profilePic lie hami const ma rakhna milena kina ki yo profile pic jun user le patha ko xa yeslie pahila cloudinary ma upload garxam
        // ani tyo cloudinary le hamile upload greko image lie euta unique id dinxa ani euta url dinxa to access this image
        // ani hami tyo cloudinary le deko url lie database ma save garxam


        let { profilePic } = req.body

        // yo req.user chai protected route bata ako ho
        const userId = req.user._id;

        // sabai vanda pahila check garni ki jun username ra email user le send greko xa tyo already arko le use greko xa ki nai
        // use greko vye teslie hami vanni ki username / email already taken vnera

        const detailsTaken = await User.find({
            $or: [
                { username: username, _id: { $ne: userId } }, // Check for username, excluding current user
                { email: email, _id: { $ne: userId } } // Check for email, excluding current user
            ]
        })

        // some chai euta array method ho re
        // yesle chai check garxa re ki atleast one array ko element le provided condition satisfy garxa ki gardaina vnera 
        // satisfy garyo vani true dinxa natra false dinxa

        // const emailTaken = detailsTaken.forEach((element) => {
        //     return element.email === email;
        // }) yesto garna mildaina re because foreach le khi pani return gardai na re

        // tara yesto garda chai chaldo rahixa

        // let emailTaken = false;
        // detailsTaken.forEach((element) => {
        //     if (element.email === email) {
        //         emailTaken = true
        //     }
        // })

        // yesto gardapani chaldo rahixa

        // const emailTaken = detailsTaken.map((element) => {
        //     return element.email === email;
        // })

        // if (usernameTaken[0]) {
        //     return res.status(400).json({ error: "Username already taken" })
        // } 


        const emailTaken = detailsTaken.some((element) => {
            return element.email === email;
        })
        const usernameTaken = detailsTaken.some((element) => {
            return element.username === username;
        })


        if (usernameTaken) {
            return res.status(400).json({ error: "Username already taken" })
        }

        if (emailTaken) {
            return res.status(400).json({ error: "Email already taken" })
        }


        // aba logged in user lie search garni jun chai hamile cookies bata get greko xa, kina ki hamilie logged in user lie modify garnu xa
        // url ko user lie search na garni kina ki url ma ta jasko pani id halna sakxan manxe haru ko url ma logged in xu
        // but mahile jai ko id halera post request grey vani ta jay ko data change huxa, testo nagarni so cookies ko id bata user search garni ani tyo update garni



        let user = await User.findById(userId)

        // if user database ma vetiyena vaney user not found return garni

        if (!user) return res.status(400).json({ error: "Yapper not found" })

        // ani aba url ma arkai user ko id deko xa yetikai wanna be hacker harule, afu logged in vyera arko ko id pass grera arko ko data change garna try garni haruko lagi
        // yo aba url ma j id xa ani cookies ma j saved vko id xa tyo different xa vanery you wanna be hacker you cannot update id of other user vanney

        if (req.params.id !== userId.toString()) return res.status(400).json({ error: `You cannot update profile of another yapper` })


        // yo jun let user xa ni , yo cahi yeuta instance ho databse ko  
        // aba hamile yehi istance lie modify grera save garna pani milxa
        // yo let user variable haina, mongo db ko instance ko so user.save() garyo vaney tyo database ma save hunxa
        // modified instance lie save garna manually await user.save() garnu parxa

        // aba locally modify garera save garni ki mongoose ko method use garni tyo depend garxa
        // if just one key change garni xa vaney mongoose kai use gera modify garni

        // if more than one change garnu xa vaney chai local ma modify grera tyo save garni
        // yesto garna easy hunxa

        // ani always make sure sab details field xa, if tyo detail modify greko xaina vaney pani tyo pass garnu parxa purano data halera
        // natra tyo key remove hunxa database bata
        // example : username, email, name xa ani aba hamile username = abc name = bcd garera save garim vaney tyo email field gayab hunxa databse bata
        // so  username = abc, email = already_database_ma_vako_data, name = bcd

        // aba new password deko xa vaney teslie hash garni ani ball save garni
        if (password) {
            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(password, salt)
            user.password = hashedPassword;
        }

        // aba hamile user le profile pic change greko xa vnaey 
        // pahila ko jun profile picture upload greko thiyo teslie pahila destroy garni
        // ani tyo new upload greko picture lie pahila cloudinary ma upload garni ani teslie userProfile ma save garni

        // user le yo vanda pahila profile picture upload greko vey matra destroy garni
        // first time user le profile picture upload gardai xa vani destroy garnu pardaina tesaile inser pani euta if (user.profilePic) 
        // use grera balla destroy greko

        if (profilePic) {
            if (user.profilePic) {
                // yesle chai k garxa vaney jun url xa ni tyo cai yesto hunxa : https://account-details/id.jpg 
                // aba hamile split by / garim hai so ["https:", "/", "/", "account-details", "/", "id.jpg"] yestari split hunxa
                // ani aba hamile .pop garim so last element i.e id.jpg hami sanga auxa ani teslie pani split garim with (".") so
                // ["id", ".", "jpg"] yesto hunxa hai
                // ani yesbata hamile first wala value leko

                // meaning hamile tyo pahila saved vako image ko id yesri get greko ani tyo id lie destroy greko kina vaney 
                // cloudinary.uploader.destroy(image_id) yo jun function xa ni tesle image id argument ma linxa ani tyo id wala image lie delete garxa
                const oldProfilePicture = await cloudinary.uploader.destroy(user.profilePic.split("/").pop().split(".")[0])
            }

            const uploadedResponse = await cloudinary.uploader.upload(profilePic)

            // aba yesto await cloudinary.uploader.upload(profilePic) grera sucessfully upload vye paxi cloudnary le response dinxa
            // tyo response lie hamile uploadedResponse variable vitra store greko xam, tyo cloudnary le object dinxa as response
            // so yo uploadedResponse euta object ho ani image successfully upload vye pani tesko secure_url vanni key ma chai 
            // uploaded image ko url auxa 
            // so we can access that by using uploadedResponse.secure_url, console log grera check pani garna milxa
            console.log(uploadedResponse)

            // eii ya neri hami profile pic lie reassign greko xam so yeslie const rakhe ko vye yeta error authiyo 

            profilePic = uploadedResponse.secure_url


        }

        // aba user le j j data change garna ko lagi post request deko xa tyo change garni, if data deko xaina vanry tehi database ma j data ahile save xa tehi save garni
        // user.data_to_change = new_data or database_ma_existing_data

        user.name = name || user.name;
        user.email = email || user.email;
        user.username = username || user.username;
        user.profilePic = profilePic || user.profilePic;


        // tara bio chai empty xa vaney teslie empty nai gardini
        user.bio = bio || "";

        // ani yo aba manually save pani garnu parxa database ma 
        user = await user.save()

        // aba hamilie yo response ma pathanu nu pani xa frontend ma nai tyo browser ko localstorage ma save hunxa so pahila password lie null greko
        user.password = null;

        // aba rko euta problem k xa vane ni
        // hamile user ko profle picture ra username post ko replies ma pani rakeko xa
        // so aba hamile yo profle update garda
        // tyo uer le jatiota pani post ma comment / reply greko xa ni
        // tya pani suer ko new uername ra user ko new profile picture if usle update greko xa vani tya pani change garnu parni vo

        // so tesko lagi hami query chaluxam
        // yo uery le user le post model vitra jatiota pani yo current looged in user le comment greko post haru xa
        // tyo sab comment greko post vitra ko replies vanni key vutra yo user le greko jati ota pani reply xa
        // tyo reply object vitra bata
        // username ra userProfilePic change garxa

        // yo query chai mahile ahile bujeko chai xaina
        await Post.updateMany(
            { "replies.userId": userId },
            {
                $set: {
                    "replies.$[reply].username": user.username,
                    "replies.$[reply].userProfilePic": user.profilePic
                }
            },
            {
                arrayFilters: [{ "reply.userId": userId }]
            }
        )

        // save garey paxi user saved successfully vanyo ani tyo saved object return garyo

        // return garda hamile euta message vanni key pani xuttai pass grni
        // tara yo jun instance xa ni tyo mongoose ko mongo db ko instance ho
        // teslie hami directly modify garna mildaina
        // so pahila hami teslie toObject vnera euta normal js object ma convert garni 
        // ani balla tyo converted object ma message vani key banau ni ani tyo converted object as response pathau ni

        const userObject = user.toObject();

        // Add message property to plain object
        userObject.message = "Account Updated Successfully";

        res.status(201).json(userObject)
        console.log(userObject)

    } catch (error) {
        res.status(500).json({ error: `There was some error ${error.message}` })
        console.log("Error in updateUserProfile : ", error.message)
    }

}

// hami suggested user ko lagi pani euta route banau xam 
// yeskle k agarxa vani ni
// current logged in user ra current logged in user le jati jana lie pani foloow greko xa, tyo bayek aru 10 ota user ko information dinxa

const getSuggestedUsers = async (req, res) => {
    try {
        const userId = req.user._id

        // current user ko id ra following ko data matra return garxa as a object .select("following") grepaxi
        // .select("following") grena vani complete user ko object return garthiyo
        const id_of_logged_in_user_and_users_followed_by_logged_in_user = await User.findById(userId).select("following")

        const usersFollowedByLoggedInUser = id_of_logged_in_user_and_users_followed_by_logged_in_user.following

        // now lets add current logged in user inside the exception array as well
        // kina ki yo logged in user lie follow yourself vnera suggestion dina milena ni ta


        // aba yesle chai k garxa vaney ni data base bata 100 users ko details dinxa except ourself 
        // yo chai k ho vani ni mongo db ko aggereate method ho
        // yesma hamile jun array pass greko xa yo chai aggerate pipeline ho re
        // each object inside array chai euta stage ho re, like steps to follow ho re
        // 1st stage complete vye paxi second stage huxa testo testo

        // so pahila k hunxa vani aggerate pipeline ko match vanni run hunxa
        // match vitra hamile k match garni deko xa, sab id haru excliding the currecnt logged in user ko

        // ani match vye pani $sample use greko xa, yesle chai randomly tyo match le jati pani find gryo ni tesbara any 100 user ko data return garxa

        // so yo code le 100 users ko details dinxa excluding us

        // hami nin i.e not in vanni mongodb ko operator use garnu parxa, yesle k garxa vani yo usersFollowedByLoggedInUser xa ni
        // tyo bayek aru 100 user ko data dinxa
        const suggestedUsers = await User.aggregate([
            {
                $match: {
                    _id: { $ne: userId },
                }
            },
            {
                $sample: { size: 100 }
            }, {
                // $project vneko chai yo data bata k k property haru exclude garni vnera ho
                // password: 0, 0 vneko exclude this property just like .select("-password")
                // username: 1, 1 vneko chai include this property re
                $project: {
                    password: 0,
                    rawPassword: 0
                }
            }
        ])

        // aba 100 user pye paxi hami filter garni, hamro following list ma yo 100 bata kunai users xa vani teslie nikali dini
        // hamile 100 user ta lekhim tara model ma 100 user nai xaina so repetative user ko data ako xa so hami repetative data lie filter garxam
        // tesko lagi pahila euta set banau nu pardo rahixa, ani tyo set ma hami k agrni vaney ni
        // set ma each visited user ko id push gardai jani ani filter ma hami chack garni ki if !set.has(user.id) meaning
        // set ma userko id present xaina bani tyo user ko id set ma haldini ani tyo user lie return garni
        // return garni vneko tyo filtered user array ma tyo usr append hunxa

        // yo array le garda pani hunxa set nai banayera garnu parxa vanni xaina

        // NOTE : wait wait tesle duplicate data dido rahina xa
        // sab uniquue uesrs deko xa so no need to filter
        // tara filter garna pani sikhey

        // const suggestedUsers = [
        //     { _id: "1", name: "User 1" },
        //     { _id: "2", name: "User 2" },
        //     { _id: "1", name: "User 1" }, // Duplicate
        //     { _id: "3", name: "User 3" },
        // ];

        // ---------- set method -----------
        // const visitedUser = new Set()

        // const filteredUsers = suggestedUsers.filter((user, index) => {
        //     if (!visitedUser.has(user._id.toString())) {
        //         visitedUser.add(user._id.toString())
        //         return true;
        //     }
        //     return false
        // });

        // --------- array method -------------
        // const visitedUser = []

        // const filteredUsers = suggestedUsers.filter((user, index) => {
        //     if (!visitedUser.includes(user._id.toString())) {
        //         visitedUser.push(user._id.toString())
        //         return true;
        //     }
        //     return false
        // });

        // aba if admin lie follow greko xaina vani admin ko data chai swattaa haldini tyo suggested user ma
        // admin ko data lini but without username ra password
        const adminUser = await User.findOne({ username: "admin" }).select("-password").select("-rawPassword")

        // aba hami k garni vney ni, suggested user bata hamilie ta ayo hamro account details bayek aru max 100 user ko details
        // tesbata aba hami admin lie already follow greko xa vani admin lie inject / push na garni
        // ani if admin lie follow greko xaina vani hami admin lie push gridini

        // yesma problem k ako thiyo vani ni, if we are logged in as admin tehi pani admin push vai rako thiyo k 
        // so tesko lagi feri logged in user admin ho ki nai tyo pani check garnu paryo adminUser.id.toString() !== userId.toString() yesari


        // so hamro suggested user huna chai
        // 1: suggested user ma admin suggested hunu vena kina ki hami admin lie paxni compolsury push garxam if follow greko xaina vani
        // 2: following ma already included hunu vyena 

        let newSuggestedUsers = suggestedUsers.filter((eachUser) => {
            return ((eachUser._id.toString() !== adminUser?._id.toString()) && !usersFollowedByLoggedInUser.includes(eachUser._id.toString()))
        })


        // so hamro suggested user ma admin push garna k condition satisfy hunu paryo vani
        // 1: admin vanni account hunu paryo
        // 2: admin ko id ra current logged in user ko id same hunu vyena i.e admin logged in hunu vyena
        // 3: admin following list ma hunu vyena ie. admin lie already follow greko

        // NOTE : adminUser.id === adminUser._id.toString()
        // meaning mongo db le virtual .id vanni create gardo rahixa
        // yo .id databse ma chai saved hudaina unless if you include id : string explicitly in user schema
        // inclue grena vani chai mongo db le ._id ko comparision ma for our convience .id vanni virtual id dido rahixa which is equal to
        // model._id.toString()

        if (adminUser && adminUser._id.toString() !== userId.toString() && !usersFollowedByLoggedInUser.includes(adminUser._id.toString())) {

            console.log(adminUser.id === adminUser._id.toString())

            newSuggestedUsers = [adminUser, ...newSuggestedUsers]
        }

        // response ma pathauda chai 10 ota matra user haru patauni 
        res.status(200).json(newSuggestedUsers.slice(0, 10))

        // }
        // else {
        //     // response ma pathauda chai 10 ota matra user haru patauni 
        //     res.status(200).json(suggestedUsers.slice(0, 9))
        // }




    } catch (error) {
        res.status(500).json({ error: `There was some error in getSuggestedUsers ${error.message}` })
    }
}

// aba user lie search garna ko lagi pani euta conroller banauni
// serach user vanni route ma gyo vani yo controller chalni parxa
// yo pani protected route hunu parxa kina ki logged in user le matra search garna pauxa ni taw

const getSearchedUser = async (req, res) => {

    try {
        const userId = req.user._id;
        if (!userId) {
            return res.status(401).json({ error: `Unauthorised, you must be logged in to perform searches` })
        }


        // get request ma ta body nai use garna mildo rahina xa 
        // so parameter ma pathanu paryo data
        // yeslie dynamic route banayera
        // const { searchedQuerry } = req.body;

        const { searchedQuerry } = req.params;



        // --- yo test index querry chai only full word search garna ko lagi rahixa, letter by letter search garni ho vani regex querry user garnu parni rahixa like below ---
        // const searchResult = await User.find({ $text: { $search: searchedQuerry } }).select('-password -rawPassword').select({ score: { $meta: "textScore" } })    // Include score field in the results
        //     .sort({ score: { $meta: "textScore" } });



        // Perform a case-insensitive partial match using regex
        // yesle chai letter to letter dido rahixa document 
        // options: i vneko chai case insenitive re r lekehni R lekeni same re 
        // $options: 'i' lie remove gara re if case sensitive search garnu xa vani eg: { username: { $regex: searchedQuerry} }

        const searchResult = await User.find({
            $or: [
                { username: { $regex: searchedQuerry, $options: 'i' } },  // Match username
                { email: { $regex: searchedQuerry, $options: 'i' } },     // Match email
                { name: { $regex: searchedQuerry, $options: 'i' } }       // Match name
            ]
        }).select('-password -rawPassword'); // Exclude sensitive fields

        // ghari ghari user serach garda toast dekhau nu xaina malie
        // if (searchResult.length < 1) {
        //     return res.status(200).json({ message: "No such user found" })
        // }

        res.status(200).json(searchResult)

    } catch (error) {
        res.status(500).json({ error: `There was some error in getSearchedUser ${error.message}` })
    }


}

export { signupUser, loginUser, logoutUser, followUnfollowUser, updateUserProfile, getUserProfile, getSuggestedUsers, getSearchedUser }

export { signupUser, loginUser, logoutUser, followUnfollowUser, updateUserProfile, getUserProfile, getSuggestedUsers, getSearchedUser }
