import redeemvouchers from "@prakrit_m/tmn-voucher";
import { Hono } from "hono";

const api = new Hono();

function convert_message(
    response: { code: string; message: string },
): string {
    switch (response.code) {
        case "VOUCHER_NOT_FOUND":
            return "ไม่พบซอง";
        case "VOUCHER_EXPIRED":
            return "ซองหมดอายุ";
        case "VOUCHER_OUT_OF_STOCK":
            return "ซองถูกใช้ไปแล้ว";
        case "CANNOT_GET_OWN_VOUCHER":
            return "ไม่สามารถใช้ซองตัวเองได้";
        case "CONDITION_NOT_MET":
            return "ไม่ตรงเงื่อนไข";
        default:
            return `การแลกซองล้มเหลว: ${response.message}`;
    }
}

api.get("/", (c) => c.text("working"));

api.post("/redeem", async (c) => {
    const data = await c.req.json();

    const phone_number = data.phone_number;
    const voucher_url = data.voucher_url;

    if (!phone_number || !voucher_url) {
        return c.json({
            success: false,
            status: 400,
            message: "กรุณาระบุเบอร์โทรศัพท์และลิงก์คูปอง",
        }, 400);
    }

    try {
        const result = await redeemvouchers(phone_number, voucher_url);

        if (result.success) {
            const ticket = result.data.tickets[0];

            if (ticket) {
                return c.json({
                    success: true,
                    status: 200,
                    message: "รับเงินสำเร็จ",
                    data: {
                        name: ticket.full_name,
                        amount: ticket.amount_baht,
                    },
                });
            }

            return c.json({
                success: false,
                status: 400,
                message: "ไมพบผู้รับซอง",
            }, 400);
        } else {
            const message = convert_message(result);
            return c.json({
                success: false,
                status: 400,
                message: message || "ไม่สามารถรับซองได้",
            }, 400);
        }
    } catch (error) {
        return c.json({
            success: false,
            status: 500,
            message: (error instanceof Error) ? error.message : "Unknown error",
        }, 500);
    }
});

export default {
    port: 3002,
    fetch: api.fetch,
};
