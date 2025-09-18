import Link from 'next/link';
import { Poppins } from 'next/font/google';
import Image from 'next/image';

const poppins = Poppins({
    weight: ['400', '500', '600', '700'],
    subsets: ['latin'],
});

export default function Banner() {
    return (
        <div
            className={`bg-[#0f1e2e] p-6 md:p-10 rounded-3xl mx-4 sm:mx-6 lg:mx-10 shadow-[0_2.8px_2.2px_rgba(0,0,0,0.034),_0_6.7px_5.3px_rgba(0,0,0,0.048),_0_12.5px_10px_rgba(0,0,0,0.06),_0_22.3px_17.9px_rgba(0,0,0,0.072),_0_41.8px_33.4px_rgba(0,0,0,0.086),_0_100px_80px_rgba(0,0,0,0.12)] flex flex-col lg:flex-row items-center justify-around gap-8 ${poppins.className}`}
        >
            <div className="w-full lg:w-1/2 flex justify-center">
                <Image
                    alt="Banner ilustrativo de gestão de estoque"
                    src="/banner2.png"
                    width={1344}
                    height={1260}
                    quality={100}
                    priority
                    className="w-full max-w-md md:max-w-lg lg:max-w-full h-auto object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                />
            </div>

            <section className="p-4 sm:p-8 lg:p-10 flex flex-col items-center text-white lg:items-start lg:w-1/2 text-center lg:text-left">
                <h1 className="font-bold text-3xl pb-5">StockControl</h1>
                <h2 className="font-semibold text-xl pb-5">
                    Gestão de estoque simples, rápida e inteligente.
                </h2>
                <p>
                    Automatize processos, evite perdas, ganhe tempo e tenha controle total do seu estoque.
                    Facilite a gestão e impulsione o crescimento do seu negócio.
                </p>

                <Link
                    href="/registro"
                    type="button"
                    className="mt-10 px-10 py-4 rounded-full bg-[#132F4C] hover:bg-[#1E4976] text-white font-bold text-base shadow-[0_2.8px_2.2px_rgba(0,_0,_0,_0.034),_0_6.7px_5.3px_rgba(0,_0,_0,_0.048),_0_12.5px_10px_rgba(0,_0,_0,_0.06),_0_22.3px_17.9px_rgba(0,_0,_0,_0.072),_0_41.8px_33.4px_rgba(0,_0,_0,_0.086),_0_100px_80px_rgba(0,_0,_0,_0.12)] transition duration-300 ease-in-out "
                >
                    Comece Agora
                </Link>
            </section>
        </div>

    );
}