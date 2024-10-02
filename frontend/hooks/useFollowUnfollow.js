import { useState } from "react"
import { useRecoilValue } from "recoil";
import userAtom from "../src/atoms/userAtom";
import useShowToast from "./useShowToast";

const useFollowUnfollow = (user) => {

    const loggedInUser = useRecoilValue(userAtom)

    // aba logged in user le current jun user ko profile view greko xa teslie follow greko xa ki nai tesko lagi pani euta state banau ni ani
    // tyo true ki false store grera rakhni
    // check garna chai hamile k greko xa vani ni
    // current logged in user ko id, jun user ko data hamile get grera yo component ma pass greko thiyem ni tesko followers list ma xa ki xaina
    // tyo check grerko, current logged in user ko id tyo followers array ma vye true return garxa navaye false auxa kina ki include use greko xa

    // ani tara user logged in nai xaina vaney ta check garna milena kina ki loggedInUser ta null xa so null._id garda ta error auxa
    // tesaile hamile ?. use greko that means ki loggedInUser null navaye matra tyo check garni
    // ani || false pani greko xa, meaning user.followers.includes(loggedInUser._id) null/undefined vye false hunxa vnera

    // paxi hami yeli following true xa ki false xa tesle follow button render garauni ho

    const [following, setFollowing] = useState(user.followers.includes(loggedInUser?._id) || false);

    // aba euta updating vanni state pani banauni kina ki hamilie jaba samma fetch request fullfil hudai ta taba samma button vitra loading chaiye ko xa
    // suruma false hunxa ani fetch garda like async function ko try vitra tyo true set garni, ani try catch finally ko finally vitra tyo feri false set garni
    // finally vye chai try complete vye ni, catch compelte vye ni tespaxni finally chai every time run gara vneko hunxa so finally always run hunxa
    const [updating, setUpdating] = useState(false);

    const customToast = useShowToast()


    // aba yo chai follow unfollow handle garxa when clicked on the follow button
    const handleFollowUnfollow = async () => {
        // frontend mai hami check garam ki user logged in xa ki nai
        // logged in na vaye fetch nai na garni
        // tara yo always hunna so backend ko lagi pani hamile yo functionality banako xa using middle ware

        if (!loggedInUser) {
            customToast("Error", "You must be logged in to perform this action", "error");
            return;
        }

        // hamile follow button thichem ani tyo fetch request chali rako xa, tara tyo chalda chaldai hamile feri follow button thichim vaney
        // yo function bata directly bahira jani

        if (updating) {
            return;
        }

        // aba try ma chai hami fetch ma post request send garni to follow ki ta unfollow
        try {
            setUpdating(true);
            const res = await fetch(`${import.meta.env.VITE_BASE_URI}/users/follow/${user._id}`, {
                method: "post",
                headers: {
                    Content: "application/json",
                },
                credentials: "include",
            });
            const data = await res.json();

            // aba eta mostly error kina auxa vne ni, hamile logged in nagareko vaye so logged in navaye auth page ma navigate garni error show grera
            // ani function bata return garni
            if (data.error) {
                customToast("Error", data.error, "error");
                navigate("/auth");
                return;
            }

            // data.error ayena vani successfully fetch complete vyo so below code run hunxa
            // aba tyo backend ma vko hami frontend ma similation grera dekhauni without fetching the new data again
            // hamile yo jun user ko profile ma xam ni teslie feri fetch garda ni hunxa but fetch request vneko data base sanga communication
            // time pani dherai lagxa ani resource pani dherai lagxa, example 10000000 users le ekai choti follow grey vani
            // follow garda pani 10000000 times post request gyo ani aba fer 10000000 times get reqest pani jani vo
            // so tehi get 10000000 get request lie prevent garna hami yo frontend mai simulate garna sakxam

            // simulation ko lagi, pailai follow greko tyiyo ahile unfollow press greko vye
            // jun hamilie user ko detail ako thiyo ni as props, teslie modify garni tesko jun yeni last element pop grera nikalni
            // kina ki hamile follower ta array.length use grera show greko xa so array ko length by 1 less vo, ani tyo pani update hunxa when component re renders

            // ani aba pahila follow greko thiyena ani ahile follow ma perss greko vye
            // jun hamilie user ko detail ako thiyo ni as props, teslie modify garni ani tesma yo current logged in user ko id followers ma push garni
            // yesle array ma 1 item push grera array lo length by 1 badayo, so rerender ma pani tyo update hunxa
            if (following) {
                customToast("Success", `Unfollowed ${user.name}`, "success");
                user.followers.pop();
            } else {
                customToast("Success", `Followed ${user.name}`, "success");
                user.followers.push(loggedInUser._id);
            }



            // ani hami aba set garni following lie opposite ma, pahila following true vye false garni, false vye true garni

            setFollowing(() => !following);


            // hamile ta yesma jabo similation matra greko xa tesaile home page ma follow garyo vani follow garni bitikai post audaina
            // tyo pani lera aunu xa vani global posts lie modify garnu parxa ni like pahila greko jasto
            // tyo chai paxi garam la
            // tyo k new array banauni, array ko contenst same to same global post ko jasto rakhni 
            // ani just tyo new array ko following haru change garni
            // *---note for self---* without new fetch request, using js ra react skill which u lack loser *---note for self---*


        } catch (error) {
            customToast("Error", error.message, "error");
        } finally {
            setUpdating(false);
        }
    };

    return { handleFollowUnfollow, updating, following }

}

export default useFollowUnfollow