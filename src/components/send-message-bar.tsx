import { Message } from "@/queries/chatQueries";
import useAuthStore from "@/store/authStore";
import useChatsStore from "@/store/chatsStore";
import useSocket from "@/store/socketStore";
import { SendHorizonal } from "lucide-react";
import { nanoid } from "nanoid";
import { useForm } from "react-hook-form";
import { Textarea } from "@heroui/input";

type SocketMsg = {
  tempId: string;
  _id: string;
  chatId: string;
  senderId: string;
  content: {
    type: "image" | "text" | "file";
    text: string;
  };
  createdAt: string;
  status: "sent" | "delivered" | "read";
};

const SendMessageBar = ({ chatId }: { chatId: string }) => {
  const { addMessageToChatAfter, updateMessageOfChat } = useChatsStore();
  const { user } = useAuthStore();
  const { socket } = useSocket();
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      message: "",
    },
  });
  const onSendMessage = (data: { message: string }) => {
    if (!user || !socket) return;
    if (data.message.trim().length === 0) {
      return;
    }
    let newMessage = {
      _id: nanoid(16),
      chatId: chatId,
      content: {
        type: "text",
        text: data.message,
      },
      createdAt: new Date().toISOString(),
      senderId: user._id,
      isUnread: true,
      isSentByCurrentUser: true,
    } as Message;
    addMessageToChatAfter(chatId, [newMessage]);
    socket.emit(
      "sendMessage",
      {
        tempId: newMessage._id,
        roomId: chatId,
        content: newMessage.content,
      },
      (msgAck: SocketMsg) => {
        updateMessageOfChat(chatId, msgAck);
      }
    );
    reset();
  };
  return (
    <form
      onSubmit={handleSubmit(onSendMessage)}
      className="flex gap-2 px-1 my-2"
    >
      <Textarea
        {...register("message")}
        placeholder="Type your message"
        radius="full"
        minRows={1}
        fullWidth
        isMultiline={false}
      />
      <button
        type="submit"
        className="bg-default-100 p-2 w-10 h-10 rounded-full"
      >
        <SendHorizonal className="text-primary" />
      </button>
    </form>
  );
};

export default SendMessageBar;
