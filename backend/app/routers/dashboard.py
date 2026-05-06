from fastapi import APIRouter
from typing import Optional
from app.database import database

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


# 1. Trend Jenis Inovasi per Tahun atau per Bulan (berdasarkan tanggal_input)
@router.get("/trend")
async def get_trend(tahun: Optional[int] = None):
    """
    Endpoint untuk mendapatkan data trend jenis inovasi (Digital/Non Digital/Teknologi).

    - Jika `tahun` tidak diberikan (None): Mengembalikan data per TAHUN (semua tahun)
    - Jika `tahun` diberikan (misal 2024): Mengembalikan data per BULAN untuk tahun tersebut

    Menggunakan tanggal_input agar semua data ter-cover tanpa batasan tahun minimum.
    """

    if tahun is None:
        query = """
        SELECT 
            EXTRACT(YEAR FROM tanggal_penerapan)::int AS tahun,
            COUNT(*) FILTER (WHERE jenis = 'Digital') AS digital,
            COUNT(*) FILTER (WHERE jenis = 'Non Digital') AS nondigital,
            COUNT(*) FILTER (WHERE jenis = 'Teknologi') AS teknologi
        FROM data_inovasi
        WHERE tanggal_penerapan IS NOT NULL
        GROUP BY tahun
        ORDER BY tahun;
        """
        return await database.fetch_all(query)
    else:
        query = """
        SELECT 
            EXTRACT(MONTH FROM tanggal_penerapan)::int AS bulan,
            COUNT(*) FILTER (WHERE jenis = 'Digital') AS digital,
            COUNT(*) FILTER (WHERE jenis = 'Non Digital') AS nondigital,
            COUNT(*) FILTER (WHERE jenis = 'Teknologi') AS teknologi
        FROM data_inovasi
        WHERE EXTRACT(YEAR FROM tanggal_penerapan) = :tahun
        GROUP BY bulan
        ORDER BY bulan;
        """
        return await database.fetch_all(query, {"tahun": tahun})


# 2. Trend Tahapan Inovasi per Tahun atau per Bulan (berdasarkan tanggal_input)
@router.get("/maturity-trend")
async def get_maturity_trend(tahun: Optional[int] = None):
    """
    Endpoint untuk mendapatkan tren jumlah inovasi per tahapan per tahun/bulan.
    Digunakan untuk grafik line chart tahapan (Penerapan/Inisiatif/Uji Coba).

    - Jika `tahun` tidak diberikan (None): Mengembalikan data per TAHUN (semua tahun)
    - Jika `tahun` diberikan (misal 2024): Mengembalikan data per BULAN untuk tahun tersebut

    Menggunakan tanggal_input agar semua data ter-cover.
    """
    if tahun is None:
        query = """
        SELECT 
            EXTRACT(YEAR FROM tanggal_penerapan)::int AS tahun,
            COUNT(*) FILTER (WHERE tahapan_inovasi = 'Penerapan') AS penerapan,
            COUNT(*) FILTER (WHERE tahapan_inovasi = 'Inisiatif') AS inisiatif,
            COUNT(*) FILTER (WHERE tahapan_inovasi = 'Uji Coba') AS ujicoba
        FROM data_inovasi
        WHERE tanggal_penerapan IS NOT NULL
        GROUP BY tahun
        ORDER BY tahun;
        """
        return await database.fetch_all(query)
    else:
        query = """
        SELECT 
            EXTRACT(MONTH FROM tanggal_penerapan)::int AS bulan,
            COUNT(*) FILTER (WHERE tahapan_inovasi = 'Penerapan') AS penerapan,
            COUNT(*) FILTER (WHERE tahapan_inovasi = 'Inisiatif') AS inisiatif,
            COUNT(*) FILTER (WHERE tahapan_inovasi = 'Uji Coba') AS ujicoba
        FROM data_inovasi
        WHERE EXTRACT(YEAR FROM tanggal_penerapan) = :tahun
        GROUP BY bulan
        ORDER BY bulan;
        """
        return await database.fetch_all(query, {"tahun": tahun})


# 3. Maturity / Tahapan Inovasi (total, untuk referensi lain jika dibutuhkan)
@router.get("/maturity")
async def get_maturity():
    query = """
    SELECT 
        tahapan_inovasi AS level, 
        COUNT(*) AS jumlah
    FROM data_inovasi
    GROUP BY tahapan_inovasi
    ORDER BY tahapan_inovasi;
    """
    return await database.fetch_all(query)


# 4. Top OPD
@router.get("/top-opd")
async def get_top_opd():
    query = """
    SELECT 
        admin_opd AS name, 
        COUNT(*) AS jumlah
    FROM data_inovasi
    GROUP BY admin_opd
    ORDER BY jumlah DESC
    LIMIT 5;
    """
    return await database.fetch_all(query)


# 5. Top Urusan
@router.get("/top-urusan")
async def get_top_urusan():
    query = """
    SELECT 
        urusan_utama AS name, 
        COUNT(*) AS jumlah
    FROM data_inovasi
    GROUP BY urusan_utama
    ORDER BY jumlah DESC
    LIMIT 5;
    """
    return await database.fetch_all(query)


# 6. Statistik Ringkas Dashboard
@router.get("/stats")
async def get_stats():
    query = """
    SELECT 
        COUNT(*) AS total_inovasi,
        ROUND(AVG(kematangan)::numeric, 1) AS rata_kematangan,
        COUNT(*) FILTER (WHERE jenis = 'Digital') AS inovasi_digital,
        COUNT(*) FILTER (
            WHERE EXTRACT(YEAR FROM tanggal_input) = EXTRACT(YEAR FROM CURRENT_DATE)
        ) AS inovasi_tahun_ini
    FROM data_inovasi;
    """
    return await database.fetch_one(query)


@router.get("/inovasi-list")
async def get_inovasi_list():
    query = """
    SELECT id, judul_inovasi
    FROM data_inovasi
    WHERE judul_inovasi IS NOT NULL
    ORDER BY judul_inovasi;
    """
    return await database.fetch_all(query)
