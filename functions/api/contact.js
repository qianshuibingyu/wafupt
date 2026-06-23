const EMAILJS = {
    userId: 'kiY7Ni8dk8ID8Mn47',
    serviceId: 'service_vs616cb',
    templateId: 'template_u99zynh'
};

export async function onRequestPost({ request }) {
    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204 });
    }

    let data;
    try {
        data = await request.json();
    } catch {
        return json({ error: 'Corpo JSON inválido' }, 400);
    }

    const name = String(data.name || '').trim();
    const phone = String(data.phone || '').trim();
    const email = String(data.email || '').trim();
    const product = String(data.product || '').trim();
    const scenario = String(data.scenario || '').trim();
    const message = String(data.message || '').trim();

    if (!name || !phone) {
        return json({ error: 'Nome e telefone são obrigatórios' }, 400);
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return json({ error: 'Endereço de email inválido' }, 400);
    }

    try {
        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                lib_version: '4.4.1',
                user_id: EMAILJS.userId,
                service_id: EMAILJS.serviceId,
                template_id: EMAILJS.templateId,
                template_params: {
                    from_name: name,
                    from_email: email,
                    name,
                    phone,
                    product,
                    scenario,
                    message
                }
            })
        });

        const text = await response.text();
        if (!response.ok) {
            return json({ error: text || 'O serviço de email rejeitou o pedido' }, response.status);
        }

        return json({ ok: true, message: text }, 200);
    } catch (err) {
        return json({ error: err.message || 'Falha ao contactar o serviço de email' }, 502);
    }
}

function json(body, status) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-store'
        }
    });
}
