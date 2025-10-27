local http = game:GetService('HttpService')


local api = 'http://skibidi.api_blablabllblbl:3002/redeem'

local data = {
	phone_number = '0618185584',
	voucher_url = 'https://gift.truemoney.com/campaign/?v=019a11adabaa766fbd6420652e0b7cba1fk'
}

local encdoed = http:JSONEncode(data)

local suc, res = pcall(function()
	return http:RequestAsync({
		Url = api,
		Method = "POST",
		Body = encdoed,
	})
end) 

if suc and res then
	local decoded = http:JSONDecode(res.Body)
	print(decoded)	
end

warn(suc, res)
