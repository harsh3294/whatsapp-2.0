import { Avatar, IconButton } from "@material-ui/core";
import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import styled from "styled-components";
import { auth, db } from "../firebase";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import { useCollection } from "react-firebase-hooks/firestore";
import Message from "./Message";
import firebase from "firebase";
import { InsertEmoticon, Mic } from "@material-ui/icons";
import { useRef, useState } from "react";
import getRecipientEmail from "../utils/getRecipientEmail";
import Timeago from "timeago-react";
// import Picker, { SKIN_TONE_LIGHT } from "emoji-picker-react";
import Modal from "@material-ui/core/Modal";
function ChatScreen({ chat, messages }) {
  const [input, setInput] = useState("");
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const endOfMessageRef = useRef(null);
  const [messagesSnapshot] = useCollection(
    db
      .collection("chats")
      .doc(router.query.id)
      .collection("messages")
      .orderBy("timestamp", "asc")
  );
  const showMessages = () => {
    if (messagesSnapshot) {
      return messagesSnapshot.docs.map((message) => (
        <Message
          key={message.id}
          user={message.data().user}
          message={{
            ...message.data(),
            timestamp: message.data().timestamp?.toDate().getTime(),
          }}
        />
      ));
    } else {
      return JSON.parse(messages).map((message) => (
        <Message key={message.id} user={message.user} message={message} />
      ));
    }
  };
  const scrollToBottom = () => {
    endOfMessageRef.current.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const sendMessage = (e) => {
    e.preventDefault();
    db.collection("users").doc(user?.uid).set(
      {
        lastSeen: firebase.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    db.collection("chats").doc(router.query.id).collection("messages").add({
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      message: input,
      user: user?.email,
      photoURL: user?.photoURL,
    });
    setInput(" ");
    scrollToBottom();
  };
  const recipientEmail = getRecipientEmail(chat?.users, user);
  const [recipientSnapshot] = useCollection(
    db
      .collection("users")
      .where("email", "==", getRecipientEmail(chat?.users, user))
  );

  const recipient = recipientSnapshot?.docs?.[0]?.data();

  return (
    <Container>
      <Header>
        {recipient ? (
          <Avatar src={recipient?.photoURL} />
        ) : (
          <Avatar>{recipientEmail[0]}</Avatar>
        )}

        <HeaderInformation>
          {recipient ? <h3>{recipient?.name}</h3> : <h3>{recipientEmail}</h3>}
          {/* <h3>{recipientEmail}</h3> */}
          {recipientSnapshot ? (
            <p>
              Last active :{" "}
              {recipient?.lastSeen?.toDate() ? (
                <Timeago datetime={recipient?.lastSeen?.toDate()} />
              ) : (
                "Unavailable"
              )}
            </p>
          ) : (
            <p>Loading Last Active</p>
          )}
        </HeaderInformation>
        <HeaderIcons>
          <IconButton>
            <AttachFileIcon />
          </IconButton>
          <IconButton>
            <MoreVertIcon />
          </IconButton>
        </HeaderIcons>
      </Header>
      <MessageContainer>
        {showMessages()}
        <EndOfMessage ref={endOfMessageRef} />
      </MessageContainer>

      <InputContainer>
        <InsertEmoticon />

        <Input value={input} onChange={(e) => setInput(e.target.value)} />
        <button hidden disabled={!input} type="submit" onClick={sendMessage}>
          Send Message
        </button>
        <Mic />
      </InputContainer>
    </Container>
  );
}

export default ChatScreen;

const Container = styled.div``;

const Header = styled.div`
  display: flex;
  position: sticky;
  background-color: white;
  top: 0;
  z-index: 100;
  padding: 11px;
  border-bottom: 1px solid whitesmoke;
  align-items: center;
  height: 80px;
`;

const HeaderInformation = styled.div`
  margin-left: 15px;
  flex: 1;
  > h3 {
    margin-bottom: 3px;
  }
  > p {
    font-size: 14px;
    color: gray;
  }
`;

const HeaderIcons = styled.div``;

const MessageContainer = styled.div`
  padding: 30px;
  background-color: #e5ded8;
  min-height: 90vh;
`;

const EndOfMessage = styled.div`
  margin-bottom: 50px;
`;

const InputContainer = styled.form`
  display: flex;
  align-items: center;
  padding: 10px;
  position: sticky;
  bottom: 0;
  background-color: white;
  z-index: 100;
`;

const Input = styled.input`
  flex: 1;
  outline: none;
  border: none;
  border-radius: 10px;
  padding: 20px;
  background-color: whitesmoke;
  margin-left: 15px;
  margin-right: 15px;
`;
