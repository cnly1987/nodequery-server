import base64 

def encode(b64_string):
    try:
        return base64.b64decode(b64_string).decode('ascii')
    except Exception as e:
        # print(e)
        b64_string += "=" * ((4 - len(b64_string) % 4) % 4)
        return base64.b64decode(b64_string).decode('ascii')

def floatStr(s):
    try:
        return float(s)
    except:
        return 0

def encodeQuery(data):
    res = {}
    res['version'] = encode(data[0])
    res['uptime'] = floatStr(encode(data[1]))
    res['sessions'] = encode(data[2])
    res['processes'] = encode(data[3])
    res['processes_array'] = encode(data[4])
    res['file_handles'] = encode(data[5])
    res['file_handles_limit'] = encode(data[6])
    res['os_kernel'] = encode(data[7])
    res['os_name'] = encode(data[8])
    res['os_arch'] = encode(data[9])
    res['cpu_name'] = encode(data[10])
    res['cpu_cores'] = encode(data[11])
    res['cpu_freq'] = encode(data[12])
    res['ram_total'] = floatStr(encode(data[13]))
    res['ram_usage'] = floatStr(encode(data[14]))
    res['swap_total'] = floatStr(encode(data[15]))
    res['swap_usage'] = floatStr(encode(data[16]))
    res['disk_array'] = encode(data[17])
    res['disk_total'] = floatStr(encode(data[18]))
    res['disk_usage'] = floatStr(encode(data[19]))
    res['connections'] = encode(data[20])
    res['nic'] = encode(data[21])
    res['ipv_4'] = encode(data[22])
    res['ipv_6'] = encode(data[23])
    res['rx'] = floatStr(encode(data[24]))
    res['tx'] = floatStr(encode(data[25]))
    res['rx_gap'] = floatStr(encode(data[26]))
    res['tx_gap'] = floatStr(encode(data[27]))
    res['loads'] = encode(data[28])
    res['load_system'] = round(floatStr(res['loads'].split(" ")[1])*100, 2)
    res['load_cpu'] = floatStr(encode(data[29]))
    res['load_io'] = floatStr(encode(data[30]))
    res['ping_eu'] = floatStr(encode(data[31]))
    res['ping_us'] = floatStr(encode(data[32]))
    res['ping_as'] = floatStr(encode(data[33]))

    return res