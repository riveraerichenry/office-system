
"use client";

type Props = {
  dvNo: string;
  setDvNo: (value: string) => void;
  dvDate: string;
  setDvDate: (value: string) => void;
  payee: string;
  setPayee: (value: string) => void;
  payor: string;
  setPayor: (value: string) => void;
  particulars: string;
  setParticulars: (value: string) => void;
};

const inputClass =
  "w-full border-0 border-b border-slate-300 bg-transparent px-0 py-2 text-sm text-slate-800 outline-none transition focus:border-[#6689A5] placeholder:text-slate-400 disabled:opacity-50";

const labelClass =
  "mb-1 block text-[11px] font-medium text-slate-400";

const sectionTitleClass =
  "mb-3 border-b border-slate-300 pb-1.5 text-sm font-medium text-[#557992]";

export default function DVDetails(props: Props) {
  return (
    <section>
      <h3 className={sectionTitleClass}>
        Disbursement Voucher Information
      </h3>

      <div className="grid grid-cols-1 gap-x-5 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">

        {/* DV NUMBER */}
        <div>
          <label className={labelClass}>
            DV Number <span className="text-red-500">*</span>
          </label>

          <input
            required
            value={props.dvNo}
            onChange={(e) => props.setDvNo(e.target.value)}
            className={inputClass}
            placeholder="Enter DV number"
          />
        </div>

        {/* DV DATE */}
        <div>
          <label className={labelClass}>
            DV Date <span className="text-red-500">*</span>
          </label>

          <input
            required
            type="date"
            value={props.dvDate}
            onChange={(e) => props.setDvDate(e.target.value)}
            className={inputClass}
          />
        </div>

        {/* PAYEE */}
        <div className="sm:col-span-2">
          <label className={labelClass}>
            Payee <span className="text-red-500">*</span>
          </label>

          <input
            required
            value={props.payee}
            onChange={(e) => props.setPayee(e.target.value)}
            className={inputClass}
            placeholder="Enter payee"
          />
        </div>

        {/* PAYOR */}
        <div className="sm:col-span-2">
          <label className={labelClass}>
            Payor
          </label>

          <input
            value={props.payor}
            onChange={(e) => props.setPayor(e.target.value)}
            className={inputClass}
            placeholder="Enter payor"
          />
        </div>

        {/* PARTICULARS */}
        <div className="sm:col-span-2 lg:col-span-4">
          <label className={labelClass}>
            Particulars
          </label>

          <textarea
            rows={2}
            value={props.particulars}
            onChange={(e) => props.setParticulars(e.target.value)}
            className="w-full resize-y border-0 border-b border-slate-300 bg-transparent px-0 py-2 text-sm text-slate-800 outline-none focus:border-[#6689A5] placeholder:text-slate-400"
            placeholder="Enter particulars"
          />
        </div>

      </div>
    </section>
  );
}
