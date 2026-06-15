import React, { useState, useRef, useEffect } from "react";
import { FiSearch, FiChevronDown } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const SearchBar = ({ value, onChange, onSearch, tickets = [] }) => {

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef();

  const uniqueTickets = Array.isArray(tickets)
    ? [...tickets]
        .filter((t, i, arr) => arr.findIndex((x) => x.id === t.id) === i)
        .sort((a, b) => b.id - a.id)
    : [];

  const selectedTicket = uniqueTickets.find((t) => t.ticketNumber === value);

  const handleSelect = (ticket) => {
    setIsOpen(false);
    onChange(ticket.ticketNumber);
    onSearch?.(ticket.ticketNumber);
  };

  const handleInput = (e) => {
    onChange(e.target.value);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);

  }, []);

  return (

    <div className="w-full max-w-2xl">

      <div className="flex flex-wrap items-center gap-3 p-3 rounded-2xl shadow-sm">

        {/* DROPDOWN */}

        <div className="relative flex-1" ref={dropdownRef}>

          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-xl border"
          >
            <span className="truncate">

              {selectedTicket
                ? `${selectedTicket.ticketNumber}`
                : "— Select Ticket —"}

            </span>

            <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
              <FiChevronDown />
            </motion.div>

          </button>

          <AnimatePresence>

            {isOpen && (

              <motion.ul
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute z-50 mt-2 w-full max-h-60 overflow-auto bg-white border rounded-xl"
              >

                {uniqueTickets.map((t) => (

                  <li
                    key={t.id}
                    onClick={() => handleSelect(t)}
                    className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100"
                  >
                    {t.ticketNumber}
                  </li>

                ))}

              </motion.ul>

            )}

          </AnimatePresence>

        </div>

        {/* MANUAL INPUT */}

        <input
          type="text"
          placeholder="Masukkan Ticket Number"
          value={value || ""}
          onChange={handleInput}
          className="flex-1 px-3 py-2 text-sm border rounded-xl"
        />

        {/* SEARCH */}

        <button
          onClick={() => value && onSearch(value)}
          disabled={!value}
          className="flex items-center gap-2 px-5 py-2 text-white rounded-xl"
          style={{
            background: value
              ? "linear-gradient(90deg, #D73A30, #872924)"
              : "#94a3b8",
          }}
        >
          <FiSearch size={15} /> Search
        </button>

      </div>

    </div>

  );
};

export default SearchBar;