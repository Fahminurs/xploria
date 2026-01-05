-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 05 Jan 2026 pada 15.29
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `xploria`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id_users` int(11) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `nama` varchar(255) DEFAULT NULL,
  `picture` varchar(512) DEFAULT NULL,
  `role` varchar(50) DEFAULT 'user',
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_expires` bigint(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id_users`, `email`, `password`, `nama`, `picture`, `role`, `reset_token`, `reset_expires`, `created_at`) VALUES
(2, 'makanan1@gmail.com', '$2b$10$AqYm8MliuFAror5QAfsuIe6LRymGOJowCrAWNHtVySj1QMnEg.Dya', 'makanan1', '/uploads/profile-1758951208256-503472900.png', 'user', NULL, NULL, '2025-09-26 11:56:53'),
(3, 'fahminursafaat@upi.edu', '$2b$10$AqYm8MliuFAror5QAfsuIe6LRymGOJowCrAWNHtVySj1QMnEg.Dya', '4B_Fahmi Nursafaat', 'https://lh3.googleusercontent.com/a/ACg8ocLkKeTmFxOrdxD-IK3DwM50yve9we8ZgLXDy4ujFgvmhnO1EQ=s96-c', 'user', NULL, NULL, '2025-09-27 03:14:54'),
(4, 'fahminursafaat@gmail.com', '$2b$10$qpzmshJtCrNGVO0Zkhccsu0Z6rA9C38OEGZI.uHPHw7EvB7LpIGhe', 'Fahmi Nursafaat', 'https://lh3.googleusercontent.com/a/ACg8ocIvo7BDnrD5pBWPwcLy9YNJvdBwC69M0kCsevfCU78Kthl8aug=s96-c', 'user', NULL, NULL, '2025-09-28 10:36:54');

-- --------------------------------------------------------

--
-- Struktur dari tabel `workspace`
--

CREATE TABLE `workspace` (
  `id_workspace` char(36) NOT NULL,
  `id_users` int(11) NOT NULL,
  `judul` varchar(255) DEFAULT NULL,
  `bloks` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`bloks`)),
  `is_starred` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `workspace`
--

INSERT INTO `workspace` (`id_workspace`, `id_users`, `judul`, `bloks`, `is_starred`, `created_at`) VALUES
('0094e721-6acd-4d6e-9405-6e6968adca23', 4, 'moment', '\"<xml xmlns=\\\"http://www.w3.org/1999/xhtml\\\"><block type=\\\"declaration_include\\\" id=\\\"1\\\" x=\\\"-137\\\" y=\\\"-137\\\"><field name=\\\"HEADER\\\">&lt;WiFi.h&gt;</field><next><block type=\\\"declaration_define\\\" id=\\\"2\\\"><field name=\\\"KEY\\\">LED_BUILTIN</field><field name=\\\"VALUE\\\">2</field><next><block type=\\\"blink_led\\\" id=\\\"3\\\" inline=\\\"false\\\"><field name=\\\"PIN\\\">2</field><next><block type=\\\"initializes_setup\\\" id=\\\"4\\\"></block></next></block></next></block></next></block><block type=\\\"initializes_loop\\\" id=\\\"5\\\" x=\\\"-137\\\" y=\\\"63\\\"></block></xml>\"', 1, '2025-11-03 12:52:29'),
('02ed0a8e-7360-4f17-bb64-13e0f7c76d91', 2, 'makanan', '\"<xml xmlns=\\\"http://www.w3.org/1999/xhtml\\\"><block type=\\\"initializes_setup\\\" id=\\\"1\\\" x=\\\"20\\\" y=\\\"20\\\"></block><block type=\\\"initializes_loop\\\" id=\\\"2\\\" x=\\\"20\\\" y=\\\"140\\\"></block></xml>\"', 0, '2025-09-27 06:10:44'),
('1652eecc-0f5a-446d-be56-c3b0f9afd2f3', 2, 'makanan', '\"<xml xmlns=\\\"http://www.w3.org/1999/xhtml\\\"><block type=\\\"initializes_setup\\\" id=\\\"1\\\" x=\\\"20\\\" y=\\\"20\\\"></block><block type=\\\"initializes_loop\\\" id=\\\"2\\\" x=\\\"20\\\" y=\\\"140\\\"></block></xml>\"', 0, '2025-09-27 06:04:34'),
('4be2b60c-9fb2-476f-a6b3-0d57777e7193', 2, 'My Project', '\"<xml xmlns=\\\"http://www.w3.org/1999/xhtml\\\"><block type=\\\"initializes_setup\\\" id=\\\"3\\\" x=\\\"20\\\" y=\\\"20\\\"></block><block type=\\\"initializes_loop\\\" id=\\\"4\\\" x=\\\"20\\\" y=\\\"140\\\"></block></xml>\"', 1, '2025-09-27 06:11:26'),
('b21c71aa-549d-4f0b-92a0-1647e9e33e6c', 3, 'My Project', '\"<xml xmlns=\\\"http://www.w3.org/1999/xhtml\\\"><block type=\\\"initializes_setup\\\" id=\\\"3\\\" x=\\\"38\\\" y=\\\"38\\\"><statement name=\\\"CONTENT\\\"><block type=\\\"blink_led\\\" id=\\\"6\\\" inline=\\\"false\\\"><field name=\\\"PIN\\\">2</field><next><block type=\\\"esp32_pin_mode\\\" id=\\\"9\\\" inline=\\\"false\\\"><field name=\\\"PINSEL\\\">0</field><field name=\\\"MODE\\\">OUTPUT</field></block></next></block></statement></block><block type=\\\"initializes_loop\\\" id=\\\"4\\\" x=\\\"20\\\" y=\\\"140\\\"></block></xml>\"', 0, '2026-01-05 14:16:59'),
('bef46af9-8029-4474-b462-ee07aea1cdea', 2, 'makanan', '\"<xml xmlns=\\\"http://www.w3.org/1999/xhtml\\\"><block type=\\\"initializes_setup\\\" id=\\\"3\\\" x=\\\"20\\\" y=\\\"20\\\"></block><block type=\\\"initializes_loop\\\" id=\\\"4\\\" x=\\\"20\\\" y=\\\"140\\\"></block></xml>\"', 0, '2025-09-27 06:07:31'),
('d87b9c5e-e541-4262-9a88-8631105ddd09', 4, 'My Project', '\"<xml xmlns=\\\"http://www.w3.org/1999/xhtml\\\"><block type=\\\"initializes_setup\\\" id=\\\"3\\\" x=\\\"13\\\" y=\\\"-37\\\"><statement name=\\\"CONTENT\\\"><block type=\\\"serial_begin\\\" id=\\\"4\\\"><field name=\\\"BAUD\\\">115200</field><next><block type=\\\"blink_led\\\" id=\\\"5\\\" inline=\\\"false\\\"><field name=\\\"PIN\\\">2</field><next><block type=\\\"esp32_i2c_begin\\\" id=\\\"6\\\" inline=\\\"false\\\"><field name=\\\"SDASEL\\\">0</field><field name=\\\"SCLSEL\\\">0</field></block></next></block></next></block></statement></block><block type=\\\"initializes_loop\\\" id=\\\"7\\\" x=\\\"13\\\" y=\\\"188\\\"><statement name=\\\"LOOP_STACK\\\"><block type=\\\"serial_print\\\" id=\\\"8\\\" inline=\\\"false\\\"><value name=\\\"CONTENT\\\"><block type=\\\"text\\\" id=\\\"9\\\"><field name=\\\"TEXT\\\">Hello Wordl</field></block></value></block></statement></block></xml>\"', 0, '2025-12-10 07:56:39'),
('ee6cf3a0-9e1d-4e56-b0c1-da042fa9dbe2', 3, 'My Project', '\"<xml xmlns=\\\"http://www.w3.org/1999/xhtml\\\"><block type=\\\"initializes_setup\\\" id=\\\"3\\\" x=\\\"20\\\" y=\\\"20\\\"></block><block type=\\\"initializes_loop\\\" id=\\\"4\\\" x=\\\"20\\\" y=\\\"140\\\"></block></xml>\"', 0, '2026-01-05 08:51:28');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id_users`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indeks untuk tabel `workspace`
--
ALTER TABLE `workspace`
  ADD PRIMARY KEY (`id_workspace`),
  ADD KEY `fk_workspace_users` (`id_users`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id_users` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `workspace`
--
ALTER TABLE `workspace`
  ADD CONSTRAINT `fk_workspace_users` FOREIGN KEY (`id_users`) REFERENCES `users` (`id_users`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
