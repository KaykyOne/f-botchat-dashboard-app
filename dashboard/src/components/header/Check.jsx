import React from 'react'

export default function Check({set, value = false}) {
    return (
        <div className="relative">
            <label
                htmlFor="checkbox"
                className="relative flex size-14 items-center justify-center overflow-hidden rounded-full bg-gradient-to-tr from-[#4158D0] via-[#C850C0] to-[#FFCC70] p-2 duration-100 hover:p-2.5"
            >
                <input type="checkbox" className="group peer hidden cursor-pointer" id="checkbox" checked={value} onChange={() => set(!value)}/>
                <label
                    htmlFor="checkbox"
                    className="size-full rounded-full bg-black peer-checked:size-0"
                ></label>
                <div
                    className="absolute left-[1.3rem] h-[4px] w-[25px] -translate-y-10 translate-x-10 rotate-[-41deg] rounded-sm bg-white duration-300 peer-checked:translate-x-0 peer-checked:translate-y-0"
                ></div>
                <div
                    className="absolute left-3 top-7 h-[4px] w-[15px] -translate-x-10 -translate-y-10 rotate-[45deg] rounded-sm bg-white duration-300 peer-checked:translate-x-0 peer-checked:translate-y-0"
                ></div>
            </label>
        </div>

    )
}
