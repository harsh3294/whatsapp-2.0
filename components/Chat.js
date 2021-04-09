import { Avatar } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection } from "react-firebase-hooks/firestore";
import styled from "styled-components";
import { auth, db } from "../firebase";
import getRecipientEmail from "../utils/getRecipientEmail";
import { useRouter } from "next/router";
function Chat({ id, users }) {
  const router = useRouter();
  const [user] = useAuthState(auth);
  const recipientEmail = getRecipientEmail(users, user);
  const [recipientSnapshot] = useCollection(
    db.collection("users").where("email", "==", getRecipientEmail(users, user))
  );

  const recipient = recipientSnapshot?.docs?.[0]?.data();
  const [messages, setMessages] = useState("");
  useEffect(() => {
    if (id) {
      db.collection("chats")
        .doc(id)
        .collection("messages")
        .orderBy("timestamp", "desc")
        .onSnapshot((snapshot) =>
          setMessages(snapshot.docs.map((doc) => doc.data()))
        );
    }
  }, [id]);

  function truncate(string, n) {
    return string?.length > n ? string.substr(0, n - 1) + "..." : string;
  }
  const enterChat = () => {
    router.push(`/chat/${id}`);
  };
  return (
    <Container onClick={enterChat}>
      {recipient ? (
        <UserAvatar src={recipient?.photoURL} />
      ) : (
        <UserAvatar>{recipientEmail[0]}</UserAvatar>
      )}
      <Span>
        {recipient ? <h3>{recipient?.name}</h3> : <h3>{recipientEmail}</h3>}
        <span>{truncate(messages[0]?.message, 30)}</span>
      </Span>
    </Container>
  );
}

export default Chat;

const Container = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 5px;
  word-break: break-word;
  :hover {
    background-color: #e9eaeb;
  }
`;

const UserAvatar = styled(Avatar)`
  margin: 5px;
  margin-right: 15px;
`;

const Span = styled.span`
  &&& {
    display: flex;
    padding: 0;
    margin-left: 15px;
    flex-direction: column;
  }
  > h3 {
    padding: 0px;
    margin-bottom: 8px;
    font-size: 16px;
  }
  > span {
    font-size: 13px;
    font-weight: 500;
    color: gray;
    margin-bottom: 8px;
  }
`;
