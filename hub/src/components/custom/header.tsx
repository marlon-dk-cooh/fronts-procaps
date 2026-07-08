import { Dispatch } from "react";
import { ThemeToggle } from "./theme-toggle";
import { LogoutButton } from "./LogoutButton";
import { Link } from "react-router-dom";
import isotipoSrc from "@/assets/isotipo.png";

type Props = {
  setIsOpenNav: Dispatch<React.SetStateAction<boolean>>;
};

export const Header = ({ setIsOpenNav }: Props) => {
  return (
    <header className="absolute lg:relative w-full flex items-center px-3 sm:px-4 py-2 text-black dark:text-white top-0 z-20 bg-background border-b border-neutral-300 dark:border-neutral-800 justify-between mb-[57px] lg:mb-0">
      <button
        className="block lg:hidden mr-1"
        onClick={() => setIsOpenNav((prev: boolean) => !prev)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-7"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 9h16.5m-16.5 6.75h16.5"
          />
        </svg>
      </button>

      <Link to="/" className="flex items-center gap-2">
        <img src={isotipoSrc} alt="SEMA" className="h-8 w-auto" />
        <span className="text-xl font-bold text-brand-primary">SEMA</span>
      </Link>

      <div className="flex flex-row gap-2">
        <ThemeToggle />
        <LogoutButton />
      </div>
    </header>
  );
};
