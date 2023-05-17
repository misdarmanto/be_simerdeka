import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ResponseData, ResponseDataAttributes } from "../../utilities/response";
import { Op } from "sequelize";
import { requestChecker } from "../../utilities/requestCheker";
import { RegistrationLoRAttributes, RegistrationLoRModel } from "../../models/registration-LoR";

export const remove = async (req: any, res: Response) => {
	const body = <RegistrationLoRAttributes>req.body;

	const emptyField = requestChecker({
		requireList: ["registration_lor_id"],
		requestData: body,
	});

	if (emptyField) {
		const message = `invalid request parameter! require (${emptyField})`;
		const response = <ResponseDataAttributes>ResponseData.error(message);
		return res.status(StatusCodes.BAD_REQUEST).json(response);
	}

	try {
		const registrationCheck = await RegistrationLoRModel.findOne({
			where: {
				deleted: { [Op.eq]: 0 },
				registration_lor_id: { [Op.eq]: req.query.registration_lor_id },
			},
		});

		if (!registrationCheck) {
			const message = `not found!`;
			const response = <ResponseDataAttributes>ResponseData.error(message);
			return res.status(StatusCodes.NOT_FOUND).json(response);
		}

		await RegistrationLoRModel.update(
			{ deleted: 1 },
			{ where: { registration_lor_id: { [Op.eq]: body.registration_lor_id } } }
		);

		const response = <ResponseDataAttributes>ResponseData.default;
		response.data = { message: "success" };
		return res.status(StatusCodes.OK).json(response);
	} catch (error: any) {
		console.log(error.message);
		const message = `unable to process request! error ${error.message}`;
		const response = <ResponseDataAttributes>ResponseData.error(message);
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(response);
	}
};
