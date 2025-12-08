<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vérifiez votre email</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f4f5;
            margin: 0;
            padding: 0;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .header {
            background: linear-gradient(135deg, #000000 0%, #333333 100%);
            padding: 40px 20px;
            text-align: center;
        }
        .logo {
            font-size: 28px;
            font-weight: 800;
            color: #ffffff;
            text-decoration: none;
            letter-spacing: -0.5px;
        }
        .sparkle {
            color: #fbbf24;
        }
        .content {
            padding: 40px;
            text-align: center;
        }
        .icon-circle {
            width: 64px;
            height: 64px;
            background-color: #f0fdf4;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 24px;
        }
        .icon {
            color: #16a34a;
            font-size: 32px;
        }
        h1 {
            margin: 0 0 16px;
            color: #18181b;
            font-size: 24px;
            font-weight: 700;
        }
        p {
            margin: 0 0 24px;
            color: #52525b;
            font-size: 16px;
        }
        .btn {
            display: inline-block;
            background-color: #18181b;
            color: #ffffff;
            padding: 14px 32px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            margin: 24px 0;
            transition: background-color 0.3s ease;
        }
        .btn:hover {
            background-color: #3f3f46;
        }
        .footer {
            background-color: #fafafa;
            padding: 24px;
            text-align: center;
            font-size: 12px;
            color: #a1a1aa;
            border-top: 1px solid #e4e4e7;
        }
        .link {
            color: #18181b;
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">
                MaliyaPay<span class="sparkle">✦</span>
            </div>
        </div>
        
        <div class="content">
            <div class="icon-circle">
                <span class="icon">✉️</span>
            </div>
            
            <h1>Vérifiez votre adresse email</h1>
            
            <p>Bonjour {{ $user->name }},</p>
            
            <p>Merci de vous être inscrit sur MaliyaPay ! Pour sécuriser votre compte et accéder à toutes les fonctionnalités, veuillez confirmer votre adresse email.</p>
            
            <a href="{{ $url }}" class="btn">Vérifier mon email</a>
            
            <p style="font-size: 14px; color: #71717a;">
                Ce lien est valable pendant 60 minutes. <br>
                Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.
            </p>
        </div>
        
        <div class="footer">
            <p>&copy; {{ date('Y') }} MaliyaPay. Tous droits réservés.</p>
            <p>Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br>
            <a href="{{ $url }}" class="link">{{ $url }}</a></p>
        </div>
    </div>
</body>
</html>
