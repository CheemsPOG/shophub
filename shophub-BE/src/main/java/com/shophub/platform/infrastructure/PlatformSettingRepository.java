package com.shophub.platform.infrastructure;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shophub.platform.domain.PlatformSetting;

public interface PlatformSettingRepository extends JpaRepository<PlatformSetting, String> {
}
