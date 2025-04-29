"use client";
import Link from "next/link";


export default function Navbar() {
 

  return (
    <nav className="font-sans bg-gradient-to-r py-[0.35rem] bg-[#0f0e17] shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px] fixed w-screen z-20 top-0">
    <div className="w-screen flex items-center justify-between px-2 lg:px-6 xl:px-10">
      <a href="/" className="flex justify-center items-center flex-col space-x-3 rtl:space-x-reverse">
        <img src="/icone.png" className="h-20" />
        <span className="p-0 pr-2  elf-center text-lg font-semibold whitespace-nowrap text-white">StockControl</span>
      </a>
        <>
          <div className="hidden items-center justify-between w-full lg:flex md:w-auto md:order-1" id="navbar-sticky">
            <ul className="flex items-center justify-center flex-row gap-36  font-medium ">
              <li>
                <a href="#recursos" className=" flex items-center justify-center flex-col font-bold py-2 px-3 text-white text-lg rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-[#b37400]  md:p-0 md:dark:hover:text-[#b37400]  dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700">
                  Recursos
                </a>
              </li>
              <li>
                <Link href="#assinatura" className="flex items-center justify-center flex-col font-bold py-2 px-3 text-white text-lg rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-[#b37400]  md:p-0 md:dark:hover:text-[#b37400]  dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700">
                  Assinatura
                </Link>
              </li>

              <div className="hidden items-center justify-center mr-5 md:order-2 space-x-4 lg:flex">
              <Link href={"/registro"} type="button" className="transition delay-150 duration-300 ease-in-out text-black bg-[#D4CCCC] focus:ring-4 focus:outline-none font-light rounded-3xl text-xl px-9 py-2 text-center ">
                Entrar
              </Link>
            </div>
              
            </ul>
          </div>
        </>
        </div>
    </nav>
  );
}
