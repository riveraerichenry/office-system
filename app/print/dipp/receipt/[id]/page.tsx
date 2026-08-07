"use client";

import {
    useEffect,
    useState,
} from "react";

import { useParams } from "next/navigation";

import axios from "axios";

import Receipt from "@/components/dipp/receipt/Receipt";

export default function ReceiptPrintPage() {

    const params = useParams();

    const id = params.id as string;

    const [loading, setLoading] =
        useState(true);

    const [header, setHeader] =
        useState<any>(null);

    const [items, setItems] =
        useState<any[]>([]);

    useEffect(() => {

        if (!id) return;

        async function load() {

            try {

                const res =
                    await axios.get(
                        `/api/dipp/transactions/${id}`
                    );

                setHeader(
                    res.data.header
                );

                setItems(
                    res.data.items
                );

                setTimeout(() => {

                    window.print();

                }, 500);

                window.onafterprint =
                    () => {

                        window.close();

                    };

            }

            catch (err) {

                console.error(err);

            }

            finally {

                setLoading(false);

            }

        }

        load();

    }, [id]);

    if (loading) {

        return (

            <div className="flex h-screen items-center justify-center">

                <span className="text-lg font-medium">
                    Loading receipt...
                </span>

            </div>

        );

    }

    if (!header) {

        return (

            <div className="flex h-screen items-center justify-center">

                <span className="text-lg font-medium text-red-600">
                    Receipt not found.
                </span>

            </div>

        );

    }

    return (

        <Receipt

            transaction={header}

            items={items}

        />

    );

}