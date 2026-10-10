import React from "react";

const Footer = () => {
  return (
    <footer className=" bg-blue-50">
      <div className="mx-auto max-w-7xl justify-between flex gap-5 p-10 text-xl text-gray-900">
        <div className="text-left">
          <h2>বাজার দর — প্রয়োজনীয় পণ্যের দাম এক নজরে।</h2>
        </div>

        <div className="text-right">
          <h2>সকল দাম সম্ভাব্য; বাজার অবস্থার ওপর নির্ভর করে পরিবর্তিত হয়।</h2>
        </div>
      </div>
    </footer>

  );
};

export default Footer;
