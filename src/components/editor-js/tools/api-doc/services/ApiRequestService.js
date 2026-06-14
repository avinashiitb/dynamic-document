const ipcRenderer = {
    invoke: (channel, ...args) => window.pluginAPI.messaging.invoke(channel, ...args)
};

export class ApiRequestService {
    constructor() { }

    buildCurlCommand(data) {
        const { method, url, request } = data;
        console.log("Building curl command for:", data);
        if (!url || !url.trim()) {
            throw new Error('URL is required');
        }

        // Replace {param} in path with values from params
        let finalUrl = url;
        if (request.params && request.params.length > 0) {
            request.params.forEach(param => {
                if (param.key && param.value) {
                    finalUrl = finalUrl.replace(new RegExp(`{${param.key}}`, 'g'), encodeURIComponent(param.value));
                }
            });
        }

        let curl = `curl -X ${method.toUpperCase()}`;

        // Add headers (authorization headers are already included in the headers array)
        if (request.headers && request.headers.length > 0) {
            request.headers.forEach(header => {
                if (header.key && header.value) {
                    // Clean up duplicate "Bearer" in Authorization headers
                    let headerValue = header.value;
                    if (header.key.toLowerCase() === 'authorization' && headerValue.startsWith('Bearer Bearer ')) {
                        headerValue = headerValue.replace('Bearer Bearer ', 'Bearer ');
                    }
                    curl += ` -H "${header.key}: ${headerValue}"`;
                }
            });
        }

        // Add request body for POST, PUT, PATCH
        if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) && request.body && request.body.trim()) {
            curl += ` -d '${request.body.replace(/'/g, "'\"'\"'")}'`;
            // Only add Content-Type if not already present in headers
            const hasContentType = request.headers && request.headers.some(h =>
                h.key && h.key.toLowerCase() === 'content-type'
            );
            if (!hasContentType) {
                curl += ` -H "Content-Type: application/json"`;
            }
        }

        curl += ` "${finalUrl}"`;

        // Add verbose output and timing
        curl += ` -w "\\nHTTP_STATUS:%{http_code}\\nTIME_TOTAL:%{time_total}\\n" -s`;

        console.log(curl);

        return curl;
    }

    async executeRequest(data) {
        try {
            const curlCommand = this.buildCurlCommand(data);
            console.log('Generated curl command:', curlCommand);

            console.log('Invoking IPC call to run-shell-command...');
            const output = await ipcRenderer.invoke("run-shell-command", curlCommand);
            console.log("API response received:", output);
            console.log("API response type:", typeof output);
            console.log("API response length:", output ? output.length : 'null/undefined');

            if (!output) {
                console.warn('No output received from shell command');
                return this.createErrorResponse('No response received from server');
            }

            return this.parseResponse(output);
        } catch (error) {
            console.error("API request error:", error);
            console.error("Error stack:", error.stack);
            return this.createErrorResponse(error.message || 'Request failed');
        }
    }

    parseResponse(output) {
        try {
            const lines = output.split('\n');
            let status = null;
            let timeTaken = null;
            let responseBody = '';

            // Collect response body lines without adding extra newlines
            const bodyLines = [];
            for (const line of lines) {
                if (line.startsWith('HTTP_STATUS:')) {
                    status = parseInt(line.split(':')[1]);
                } else if (line.startsWith('TIME_TOTAL:')) {
                    timeTaken = Math.round(parseFloat(line.split(':')[1]) * 1000); // Convert to ms and round
                } else if (!line.startsWith('HTTP_STATUS:') && !line.startsWith('TIME_TOTAL:')) {
                    bodyLines.push(line);
                }
            }
            responseBody = bodyLines.join('\n');

            // Try to parse response body as JSON, preserve original format if it fails
            let parsedBody = {};
            const trimmedBody = responseBody.trim();

            if (!trimmedBody) {
                parsedBody = {};
            } else {
                try {
                    parsedBody = JSON.parse(trimmedBody);
                } catch (e) {
                    // If JSON parsing fails, preserve the trimmed text as-is
                    parsedBody = trimmedBody;
                }
            }

            return {
                status: status,
                timeTaken: timeTaken,
                headers: {}, // Could be enhanced to parse response headers
                body: parsedBody
            };
        } catch (parseError) {
            console.error('Error parsing response:', parseError);
            return this.createErrorResponse('Failed to parse response');
        }
    }

    createErrorResponse(error) {
        return {
            status: null,
            timeTaken: null,
            headers: {},
            body: { error: error }
        };
    }

    updateUrlWithQueryParams(url, queryParams) {
        // Remove any existing query string
        let [base,] = url.split('?');

        // Build new query string
        const validQuery = (queryParams || []).filter(q => q.key && q.value);
        let queryString = '';
        if (validQuery.length > 0) {
            queryString = validQuery.map(q => `${encodeURIComponent(q.key)}=${encodeURIComponent(q.value)}`).join('&');
        }

        let newUrl = base;
        if (queryString) {
            newUrl += '?' + queryString;
        }

        return newUrl;
    }
}
