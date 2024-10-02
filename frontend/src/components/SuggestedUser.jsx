import { Avatar, Box, Button, Flex, Text } from "@chakra-ui/react";
import React from "react";
import { Link } from "react-router-dom";
import useFollowUnfollow from "../../hooks/useFollowUnfollow";

const SuggestedUser = ({ user }) => {
    const { handleFollowUnfollow, updating, following } = useFollowUnfollow(user);

    return (
        <Flex gap={2} justifyContent={"space-between"} alignItems={"center"}>
            <Flex gap={2} as={Link} to={`${user.username}`}>
                <Avatar name={user.name} src={user.profilePic} />
                <Box>
                    <Text fontSize={"sm"} fontWeight={"bold"}>
                        {user.username}
                    </Text>
                    <Text color={"gray.light"} fontSize={"sm"}>
                        {user.name}
                    </Text>
                </Box>
            </Flex>
            <Button
                size={"sm"}
                color={following ? "black" : "white"}
                bg={following ? "white" : "blue.400"}
                // onClick={handleFollow}
                isLoading={updating}
                _hover={{
                    color: following ? "black" : "white",
                    opacity: ".8",
                }}
                onClick={handleFollowUnfollow}
            >
                {following ? "Unfollow" : "Follow"}
            </Button>
        </Flex>
    );
};

export default SuggestedUser;
