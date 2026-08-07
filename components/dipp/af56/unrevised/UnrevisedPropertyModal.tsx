"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import axios from "axios";
import Swal from "sweetalert2";

import BookletHeader from "../../general/BookletHeader";
import UnrevisedPropertyInformation from "./UnrevisedPropertyInformation";
import UnrevisedPropertyItems from "./UnrevisedPropertyItems";

type Item = {
  td_number: string;

  assessed_value: number;

  start_quarter: number;
  start_year: number;

  end_quarter: number;
  end_year: number;

  basic: number;
  sef: number;
  penalty: number;
  discount: number;
};

type Props = {
  open: boolean;
  booklet: any;
  onClose: () => void;
  onSuccess: () => void;
};

export const emptyItem = (): Item => ({
  td_number: "",

  assessed_value: 0,

  start_quarter: 1,
  start_year: new Date().getFullYear(),

  end_quarter: 4,
  end_year: new Date().getFullYear(),

  basic: 0,
  sef: 0,
  penalty: 0,
  discount: 0,
});


export default function UnrevisedPropertyModal({
  open,
  booklet,
  onClose,
  onSuccess,
}: Props) {


  const [payor, setPayor] =
    useState("");

  const [receiptDate, setReceiptDate] =
    useState(
      new Date()
        .toISOString()
        .substring(0,10)
    );


  const [owner, setOwner] =
    useState("");

  const [barangay, setBarangay] =
    useState("");

  const [classification, setClassification] =
    useState("");


  const [barangays, setBarangays] =
    useState<any[]>([]);


  const [classifications, setClassifications] =
    useState<any[]>([]);


  const [items, setItems] =
    useState<Item[]>([
      emptyItem(),
    ]);


  const [saving, setSaving] =
    useState(false);



  useEffect(() => {

    if (!open) return;


    const loadMetadata = async () => {

      try {

        const res =
          await axios.get(
            "/api/rpt/property-metadata"
          );


        setBarangays(
          res.data.barangays ?? []
        );


        setClassifications(
          res.data.classifications ?? []
        );


      } catch(err){

        console.error(err);

      }

    };


    loadMetadata();


  },[open]);



  const grandTotal =
    useMemo(() => {

      return items.reduce(

        (sum,row)=>

          sum +

          Number(row.basic ?? 0) +

          Number(row.sef ?? 0) +

          Number(row.penalty ?? 0) -

          Number(row.discount ?? 0),

        0

      );

    },[items]);



  const handleProcess = async () => {


    if(!booklet){

      Swal.fire(
        "Error",
        "Booklet is required.",
        "error"
      );

      return;

    }



    if(!payor.trim()){

      Swal.fire(
        "Validation",
        "Payor is required.",
        "warning"
      );

      return;

    }



    if(!owner.trim()){

      Swal.fire(
        "Validation",
        "Owner is required.",
        "warning"
      );

      return;

    }



    if(items.length === 0){

      Swal.fire(
        "Validation",
        "Add at least one property item.",
        "warning"
      );

      return;

    }



    try {


      setSaving(true);



      const res =
        await axios.post(

          "/api/dipp/transactions/unrevised",

          {

            booklet_registration_id:
              booklet.id,


            receipt_date:
              receiptDate,


            payor,


            owner,


            barangay,


            classification,


            payment_mode:
              "Cash",


            remarks:
              null,


            items,

          }

        );



      Swal.fire({

        icon:"success",

        title:"Collection Processed",

        text:
          `OR No. ${res.data.or_number} successfully issued.`,

        confirmButtonColor:"#2563eb",

      });



      onSuccess();

      onClose();



    } catch(err:any){


      console.error(err);


      Swal.fire(

        "Error",

        err.response?.data?.message ??
        "Unable to process collection.",

        "error"

      );


    } finally {


      setSaving(false);


    }

  };



  if(!open) return null;



  return (

    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-6">


      <div className="flex h-[94vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">


        <BookletHeader booklet={booklet} />



        <div className="flex-1 space-y-6 overflow-y-auto bg-slate-100 p-6">


          <UnrevisedPropertyInformation

            payor={payor}

            receiptDate={receiptDate}

            owner={owner}

            barangay={barangay}

            classification={classification}


            barangays={barangays}

            classifications={classifications}


            onPayorChange={setPayor}

            onReceiptDateChange={setReceiptDate}

            onOwnerChange={setOwner}

            onBarangayChange={setBarangay}

            onClassificationChange={
              setClassification
            }

          />



          <UnrevisedPropertyItems

            items={items}

            setItems={setItems}

            emptyItem={emptyItem}

          />


        </div>



        <div className="border-t bg-white px-6 py-4">


          <div className="flex items-center justify-between">



            <button

              onClick={onClose}

              disabled={saving}

              className="rounded-xl border border-slate-300 bg-white px-8 py-3 font-medium text-slate-700 hover:bg-slate-50"

            >

              Cancel

            </button>



            <div className="text-right">


              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">

                Grand Total

              </div>


              <div className="text-3xl font-bold text-blue-700">

                ₱

                {grandTotal.toLocaleString(

                  "en-PH",

                  {

                    minimumFractionDigits:2,

                  }

                )}

              </div>


            </div>



            <button

              onClick={handleProcess}

              disabled={saving}

              className="rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white hover:bg-blue-700 disabled:bg-slate-400"

            >

              {saving
                ? "Processing..."
                : "Process Collection"}

            </button>



          </div>


        </div>


      </div>


    </div>

  );

}