// import { NextRequest, NextResponse } from "next/server";
// import jwt from "jsonwebtoken";

// const SECRET = process.env.JWT_SECRET!;

// export async function GET(req: NextRequest) {
//   try {
//     const token =
//       req.cookies.get("token")?.value;

//     if (!token) {
//       return NextResponse.json(
//         { error: "Unauthorized" },
//         { status: 401 }
//       );
//     }

//     const decoded = jwt.verify(
//       token,
//       SECRET
//     ) as any;

//     return NextResponse.json({
//       success: true,
//       user: decoded,
//     });
//   } catch (error) {
//     return NextResponse.json(
//       { error: "Invalid token" },
//       { status: 401 }
//     );
//   }
// }



import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET!;

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get("token")?.value;

        if (!token) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const decoded = jwt.verify(token, SECRET) as any;

        return NextResponse.json({
            full_name: decoded.full_name,
            role_name: decoded.roles?.[0]?.role_name ?? "",
        });

    } catch (err) {
        return NextResponse.json(
            { message: "Unauthorized" },
            { status: 401 }
        );
    }
}