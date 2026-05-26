// src/components/SearchBar.jsx

import { Search } from "lucide-react";

export default function SearchBar({
  keyword,
  setKeyword,
}) {

  return (

    <div className="search-box">

      <input
        type="text"
        placeholder="Tìm theo tên giáo viên hoặc tên bài kiểm tra..."
        value={keyword}
        onChange={(e) =>
          setKeyword(e.target.value)
        }
      />

      <Search size={20} />

    </div>

  );
}