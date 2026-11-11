cmake_minimum_required(VERSION 3.21)

cmake_policy(SET CMP0091 NEW)
project(aira_native_ugrep LANGUAGES C CXX)

if(NOT MSVC)
  message(FATAL_ERROR "Aira Windows ugrep must be built with MSVC")
endif()

foreach(source_name UGREP PCRE2 ZLIB BZIP2 ZSTD BROTLI)
  if(NOT DEFINED AIRA_${source_name}_SOURCE_DIR)
    message(FATAL_ERROR "Missing AIRA_${source_name}_SOURCE_DIR")
  endif()
endforeach()

if(NOT DEFINED AIRA_UGREP_OUTPUT_DIR)
  message(FATAL_ERROR "Missing AIRA_UGREP_OUTPUT_DIR")
endif()

set(CMAKE_MSVC_RUNTIME_LIBRARY "MultiThreaded$<$<CONFIG:Debug>:Debug>")
set(BUILD_SHARED_LIBS OFF CACHE BOOL "" FORCE)
set(BUILD_TESTING OFF CACHE BOOL "" FORCE)

# 随机构建目录不能进入最终 PE，否则同版本工具无法跨 CLI 复用同一份 runtime cache。
if(DEFINED AIRA_BUILD_PATH)
  add_compile_options("/pathmap:${AIRA_BUILD_PATH}=aira-native-search")
endif()

set(BUILD_STATIC_LIBS ON CACHE BOOL "" FORCE)
set(PCRE2_BUILD_PCRE2_8 ON CACHE BOOL "" FORCE)
set(PCRE2_BUILD_PCRE2_16 OFF CACHE BOOL "" FORCE)
set(PCRE2_BUILD_PCRE2_32 OFF CACHE BOOL "" FORCE)
set(PCRE2_BUILD_PCRE2GREP OFF CACHE BOOL "" FORCE)
set(PCRE2_BUILD_TESTS OFF CACHE BOOL "" FORCE)
set(PCRE2_SHOW_REPORT OFF CACHE BOOL "" FORCE)
set(PCRE2_STATIC_RUNTIME ON CACHE BOOL "" FORCE)
set(PCRE2_SUPPORT_JIT ON CACHE BOOL "" FORCE)
add_subdirectory("${AIRA_PCRE2_SOURCE_DIR}" pcre2 EXCLUDE_FROM_ALL)

set(SKIP_INSTALL_ALL ON CACHE BOOL "" FORCE)
add_subdirectory("${AIRA_ZLIB_SOURCE_DIR}" zlib EXCLUDE_FROM_ALL)

add_library(aira_bzip2 STATIC
  "${AIRA_BZIP2_SOURCE_DIR}/blocksort.c"
  "${AIRA_BZIP2_SOURCE_DIR}/huffman.c"
  "${AIRA_BZIP2_SOURCE_DIR}/crctable.c"
  "${AIRA_BZIP2_SOURCE_DIR}/randtable.c"
  "${AIRA_BZIP2_SOURCE_DIR}/compress.c"
  "${AIRA_BZIP2_SOURCE_DIR}/decompress.c"
  "${AIRA_BZIP2_SOURCE_DIR}/bzlib.c"
)
target_compile_definitions(aira_bzip2 PRIVATE _CRT_SECURE_NO_WARNINGS)
target_include_directories(aira_bzip2 PUBLIC "${AIRA_BZIP2_SOURCE_DIR}")

set(ZSTD_BUILD_CONTRIB OFF CACHE BOOL "" FORCE)
set(ZSTD_BUILD_PROGRAMS OFF CACHE BOOL "" FORCE)
set(ZSTD_BUILD_SHARED OFF CACHE BOOL "" FORCE)
set(ZSTD_BUILD_STATIC ON CACHE BOOL "" FORCE)
set(ZSTD_BUILD_TESTS OFF CACHE BOOL "" FORCE)
set(ZSTD_USE_STATIC_RUNTIME ON CACHE BOOL "" FORCE)
add_subdirectory("${AIRA_ZSTD_SOURCE_DIR}/build/cmake" zstd EXCLUDE_FROM_ALL)

set(BROTLI_BUNDLED_MODE ON CACHE BOOL "" FORCE)
add_subdirectory("${AIRA_BROTLI_SOURCE_DIR}" brotli EXCLUDE_FROM_ALL)

set(AIRA_VIIZ_SOURCE_DIR "${AIRA_UGREP_SOURCE_DIR}/lzma/C")
add_library(aira_viiz STATIC
  "${AIRA_VIIZ_SOURCE_DIR}/viizip.c"
  "${AIRA_VIIZ_SOURCE_DIR}/7zAlloc.c"
  "${AIRA_VIIZ_SOURCE_DIR}/7zArcIn.c"
  "${AIRA_VIIZ_SOURCE_DIR}/7zBuf.c"
  "${AIRA_VIIZ_SOURCE_DIR}/7zBuf2.c"
  "${AIRA_VIIZ_SOURCE_DIR}/7zCrc.c"
  "${AIRA_VIIZ_SOURCE_DIR}/7zCrcOpt.c"
  "${AIRA_VIIZ_SOURCE_DIR}/7zDec.c"
  "${AIRA_VIIZ_SOURCE_DIR}/7zFile.c"
  "${AIRA_VIIZ_SOURCE_DIR}/7zStream.c"
  "${AIRA_VIIZ_SOURCE_DIR}/Bcj2.c"
  "${AIRA_VIIZ_SOURCE_DIR}/Bra.c"
  "${AIRA_VIIZ_SOURCE_DIR}/Bra86.c"
  "${AIRA_VIIZ_SOURCE_DIR}/BraIA64.c"
  "${AIRA_VIIZ_SOURCE_DIR}/CpuArch.c"
  "${AIRA_VIIZ_SOURCE_DIR}/Delta.c"
  "${AIRA_VIIZ_SOURCE_DIR}/Lzma2Dec.c"
  "${AIRA_VIIZ_SOURCE_DIR}/LzmaDec.c"
  "${AIRA_VIIZ_SOURCE_DIR}/Ppmd7.c"
  "${AIRA_VIIZ_SOURCE_DIR}/Ppmd7Dec.c"
)
target_compile_definitions(aira_viiz PRIVATE
  Z7_PPMD_SUPPORT
  Z7_EXTRACT_ONLY
  NDEBUG
  _CRT_SECURE_NO_WARNINGS
)
target_include_directories(aira_viiz PUBLIC "${AIRA_VIIZ_SOURCE_DIR}")

set(AIRA_REFLEX_SOURCES
  "${AIRA_UGREP_SOURCE_DIR}/lib/block_scripts.cpp"
  "${AIRA_UGREP_SOURCE_DIR}/lib/composer.cpp"
  "${AIRA_UGREP_SOURCE_DIR}/lib/convert.cpp"
  "${AIRA_UGREP_SOURCE_DIR}/lib/debug.cpp"
  "${AIRA_UGREP_SOURCE_DIR}/lib/error.cpp"
  "${AIRA_UGREP_SOURCE_DIR}/lib/input.cpp"
  "${AIRA_UGREP_SOURCE_DIR}/lib/language_scripts.cpp"
  "${AIRA_UGREP_SOURCE_DIR}/lib/letter_case.cpp"
  "${AIRA_UGREP_SOURCE_DIR}/lib/letter_scripts.cpp"
  "${AIRA_UGREP_SOURCE_DIR}/lib/matcher.cpp"
  "${AIRA_UGREP_SOURCE_DIR}/lib/pattern.cpp"
  "${AIRA_UGREP_SOURCE_DIR}/lib/posix.cpp"
  "${AIRA_UGREP_SOURCE_DIR}/lib/simd.cpp"
  "${AIRA_UGREP_SOURCE_DIR}/lib/unicode.cpp"
  "${AIRA_UGREP_SOURCE_DIR}/lib/utf8.cpp"
)

add_library(aira_reflex STATIC ${AIRA_REFLEX_SOURCES})
target_compile_definitions(aira_reflex PRIVATE WITH_NO_CODEGEN)

add_executable(ugrep
  "${AIRA_UGREP_SOURCE_DIR}/src/ugrep.cpp"
  "${AIRA_UGREP_SOURCE_DIR}/src/cnf.cpp"
  "${AIRA_UGREP_SOURCE_DIR}/src/glob.cpp"
  "${AIRA_UGREP_SOURCE_DIR}/src/output.cpp"
  "${AIRA_UGREP_SOURCE_DIR}/src/query.cpp"
  "${AIRA_UGREP_SOURCE_DIR}/src/screen.cpp"
  "${AIRA_UGREP_SOURCE_DIR}/src/stats.cpp"
  "${AIRA_UGREP_SOURCE_DIR}/src/vkey.cpp"
  "${AIRA_UGREP_SOURCE_DIR}/src/zopen.c"
)

add_library(aira_ugrep_contract INTERFACE)
target_compile_definitions(aira_ugrep_contract INTERFACE
  HAVE_LIBBROTLI
  HAVE_LIBBZ2
  HAVE_LIBZ
  HAVE_LIBZSTD
  HAVE_PCRE2
  NDEBUG
  PCRE2_STATIC
  WITH_COLOR
  WITH_NO_INDENT
  _CONSOLE
  _CRT_NONSTDC_NO_WARNINGS
  _CRT_SECURE_NO_WARNINGS
)
if(CMAKE_GENERATOR_PLATFORM STREQUAL "ARM64")
  target_compile_definitions(aira_ugrep_contract INTERFACE HAVE_NEON)
else()
  target_compile_definitions(aira_ugrep_contract INTERFACE HAVE_SSE2)
endif()
target_compile_features(aira_ugrep_contract INTERFACE cxx_std_17)
# ugrep 固定源码是无 BOM UTF-8；中文 Windows 按 CP936 解析时会触发 C4819/C1070，并改写 UTF-8 字符串字面量。
target_compile_options(aira_ugrep_contract INTERFACE
  /utf-8
  $<$<COMPILE_LANGUAGE:CXX>:/EHsc>
)
target_include_directories(aira_ugrep_contract INTERFACE
  "${AIRA_UGREP_SOURCE_DIR}/include"
  "${AIRA_UGREP_SOURCE_DIR}/src"
  "${AIRA_VIIZ_SOURCE_DIR}"
)

target_link_libraries(aira_reflex PRIVATE aira_ugrep_contract pcre2-8-static)
target_link_libraries(ugrep PRIVATE
  aira_ugrep_contract
  aira_reflex
  aira_viiz
  pcre2-8-static
  zlibstatic
  aira_bzip2
  libzstd_static
  brotlienc
  brotlidec
  brotlicommon
)
target_link_options(ugrep PRIVATE /Brepro)
set_target_properties(ugrep PROPERTIES
  RUNTIME_OUTPUT_DIRECTORY "${AIRA_UGREP_OUTPUT_DIR}"
  RUNTIME_OUTPUT_DIRECTORY_RELEASE "${AIRA_UGREP_OUTPUT_DIR}"
)
