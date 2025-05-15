class ApiResponse{
    constructor(statusCode,data,message="Something went wrong"){
        this.status = statusCode < 400;
        this.success = statusCode===200?true:false;
        this.data = data;
        this.message = message;
    }
}
module.exports = ApiResponse;