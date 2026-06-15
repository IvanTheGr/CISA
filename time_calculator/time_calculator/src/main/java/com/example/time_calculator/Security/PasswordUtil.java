package com.example.time_calculator.Security;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.util.Base64;

public class PasswordUtil {

    public static boolean verify(String rawPassword, String dbPassword) {
        try {
            if (dbPassword == null || !dbPassword.contains("$")) return false;

            // 1. Normalisasi Prefix
            if (!dbPassword.startsWith("$")) {
                dbPassword = "$" + dbPassword;
            }

            String[] parts = dbPassword.split("\\$");

            // Format: [empty, pbkdf2-sha512, rounds, salt, hash]
            if (parts.length != 5) return false;

            int iterations = Integer.parseInt(parts[2]);
            String odooSalt = parts[3];
            String odooHash = parts[4];

            // ==========================================
            // LANGKAH KRUSIAL: DECODE SALT & HASH
            // ==========================================

            // Odoo menggunakan '.' sebagai ganti '+'. Kita kembalikan ke standar Java.
            String javaSalt = odooSalt.replace(".", "+");
            String javaHash = odooHash.replace(".", "+");

            // Java Base64 butuh padding '=' agar panjangnya kelipatan 4
            javaSalt = padBase64(javaSalt);
            javaHash = padBase64(javaHash);

            // Decode Salt dari Base64 string ke Raw Bytes
            byte[] saltBytes = Base64.getDecoder().decode(javaSalt);

            // Decode Hash asli dari DB untuk perbandingan byte-to-byte (lebih akurat)
            byte[] dbHashBytes = Base64.getDecoder().decode(javaHash);

            // ==========================================
            // PROSES HASHING
            // ==========================================
            PBEKeySpec spec = new PBEKeySpec(
                    rawPassword.toCharArray(),
                    saltBytes, // Gunakan salt yg sudah didecode
                    iterations,
                    512 // Key length bits
            );

            SecretKeyFactory skf = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA512");
            byte[] calculatedHashBytes = skf.generateSecret(spec).getEncoded();

            // ==========================================
            // BANDINGKAN
            // ==========================================
            // Bandingkan byte array hasil hitungan dengan byte array dari DB
            if (calculatedHashBytes.length != dbHashBytes.length) return false;

            int diff = 0;
            for (int i = 0; i < calculatedHashBytes.length; i++) {
                diff |= calculatedHashBytes[i] ^ dbHashBytes[i];
            }
            return diff == 0;

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    // Helper untuk menambah padding Base64 (=)
    private static String padBase64(String s) {
        while (s.length() % 4 != 0) {
            s += "=";
        }
        return s;
    }
}