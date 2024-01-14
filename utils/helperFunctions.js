import bcrypt, { genSalt, hash } from "bcrypt";

export const getHashPassword = async (password) =>{

    let salt = await genSalt(10);
    let hashPassword = await hash(password,salt);

    return hashPassword

}