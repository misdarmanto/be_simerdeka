import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Op } from "sequelize";
import { ResponseData, ResponseDataAttributes } from "../../utilities/response";
import { hashPassword } from "../../utilities/scure_password";
import { requestChecker } from "../../utilities/requestCheker";
import { UserAttributes, UserModel } from "../../models/user";
import { generateAccessToken } from "../../utilities/jwt";

export const login = async (req: any, res: Response) => {
	const body = <UserAttributes>req.body;

	const emptyField = requestChecker({
		requireList: ["email", "password"],
		requestData: body,
	});

	if (emptyField) {
		const message = `invalid request parameter! require (${emptyField})`;
		const response = <ResponseDataAttributes>ResponseData.error(message);
		return res.status(StatusCodes.BAD_REQUEST).json(response);
	}

	try {
		const user = await UserModel.findOne({
			raw: true,
			where: {
				deleted: { [Op.eq]: 0 },
				email: { [Op.eq]: body.email },
			},
		});

		if (!user) {
			const message = "Akun tidak ditemukan. Silahkan lakukan pendaftaran terlebih dahulu!";
			const response = <ResponseDataAttributes>ResponseData.error(message);
			return res.status(StatusCodes.NOT_FOUND).json(response);
		}

		if (hashPassword(body.password) !== user?.password) {
			const message = "kombinasi email dan password tidak ditemukan!";
			const response = <ResponseDataAttributes>ResponseData.error(message);
			return res.status(StatusCodes.UNAUTHORIZED).json(response);
		}

		const token = generateAccessToken({ user_id: user.user_id, role: body.role });

		const response = <ResponseDataAttributes>ResponseData.default;
		response.data = { token };
		return res.status(StatusCodes.OK).json(response);
	} catch (error: any) {
		console.log(error.message);
		const message = `unable to process request! error ${error.message}`;
		const response = <ResponseDataAttributes>ResponseData.error(message);
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(response);
	}
};
