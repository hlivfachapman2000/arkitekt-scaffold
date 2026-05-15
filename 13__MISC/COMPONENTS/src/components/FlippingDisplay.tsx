import React from "react";
import { TextFlippingBoard } from "./ui/text-flipping-board";

export const FlippingDisplay = ({ text }: { text: string }) => {
  return (
    <div className="rounded-[32px] bg-[#0c0c0c] border border-white/5 p-8 my-4">
      <TextFlippingBoard text={text} />
    </div>
  );
};
